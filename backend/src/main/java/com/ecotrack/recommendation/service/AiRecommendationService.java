package com.ecotrack.recommendation.service;

import com.ecotrack.recommendation.dto.RecommendationDTO;
import com.ecotrack.recommendation.dto.UserContextDTO;
import com.ecotrack.recommendation.entity.Recommendation;
import com.ecotrack.recommendation.exception.RecommendationCooldownException;
import com.ecotrack.recommendation.repository.RecommendationRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiRecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final ContextAssemblyService contextAssemblyService;
    private final PromptBuilderService promptBuilderService;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;
    private final com.ecotrack.ai.history.AiGenerationHistoryRepository historyRepository;

    @Value("${app.ai.recommendation.cooldown-minutes:1}")
    private int cooldownMinutes;
    
    // Check cooldown based on latest generated recommendation
    private void checkCooldown(Long userId) {
        List<Recommendation> recent = recommendationRepository.findByUserIdAndCreatedAtAfter(
                userId, LocalDateTime.now().minusMinutes(cooldownMinutes));
                
        if (!recent.isEmpty()) {
            // Find the most recent one to calculate exact cooldown
            Recommendation mostRecent = recent.stream()
                .max((r1, r2) -> r1.getCreatedAt().compareTo(r2.getCreatedAt()))
                .orElse(recent.get(0));
                
            LocalDateTime nextAllowedTime = mostRecent.getCreatedAt().plusMinutes(cooldownMinutes);
            long secondsRemaining = java.time.Duration.between(LocalDateTime.now(), nextAllowedTime).getSeconds();
            
            // if somehow negative, let it pass or return 1
            if (secondsRemaining <= 0) return;
            
            throw new RecommendationCooldownException("Recommendation generation is temporarily unavailable.", secondsRemaining);
        }
    }

    @Transactional
    public List<RecommendationDTO> generateRecommendations(Long userId) {
        checkCooldown(userId);
        
        List<com.ecotrack.ai.history.AiGenerationHistory> histories = historyRepository.findTop5ByUserIdAndContentTypeOrderByGeneratedAtDesc(userId, com.ecotrack.ai.history.AiGenerationHistory.ContentType.RECOMMENDATION);
        List<String> previousRecommendations = new ArrayList<>();
        for (com.ecotrack.ai.history.AiGenerationHistory history : histories) {
            try {
                List<RecommendationDTO> oldRecs = objectMapper.readValue(history.getContentJson(), new TypeReference<>() {});
                for (RecommendationDTO rec : oldRecs) {
                    previousRecommendations.add(rec.getRecommendation());
                }
            } catch (Exception e) {
                log.warn("Failed to parse history JSON", e);
            }
        }
        
        UserContextDTO context = contextAssemblyService.assembleContext(userId, previousRecommendations);
        
        // Zero-data short circuit
        if (context.getEligibleTargets() == null || context.getEligibleTargets().isEmpty()) {
            log.info("No eligible targets for user {}, returning deterministic starter tips.", userId);
            List<Recommendation> fallback = getFallbackRecommendations(userId);
            recommendationRepository.deleteByUserId(userId);
            return recommendationRepository.saveAll(fallback).stream().map(this::mapToDTO).collect(Collectors.toList());
        }

        String prompt = promptBuilderService.buildPrompt(context);
        
        List<Recommendation> generated = new ArrayList<>();
        try {
            String aiResponse = chatClient.prompt(prompt).call().content();
            log.info("AI Response: {}", aiResponse);
            
            // Clean markdown JSON ticks if present
            if (aiResponse.startsWith("```json")) {
                aiResponse = aiResponse.substring(7);
                if (aiResponse.endsWith("```")) {
                    aiResponse = aiResponse.substring(0, aiResponse.length() - 3);
                }
            }
            
            List<Map<String, Object>> responseList = objectMapper.readValue(aiResponse, new TypeReference<>() {});
            for (Map<String, Object> map : responseList) {
                String catCode = (String) map.get("categoryCode");
                String subCat = (String) map.get("subCategoryName");
                String recommendation = (String) map.get("recommendation");
                String rationale = (String) map.get("rationale");
                
                // Validate against eligible targets
                boolean isValidTarget = context.getEligibleTargets().stream()
                    .anyMatch(t -> t.getCategoryCode().equals(catCode) && t.getSubCategoryName().equals(subCat));
                
                if (!isValidTarget || recommendation == null || catCode == null) {
                    log.warn("Discarding invalid or hallucinated recommendation target: {} / {}", catCode, subCat);
                    continue;
                }
                
                // Exact text duplicate check
                boolean isDuplicate = previousRecommendations.stream()
                    .anyMatch(prev -> prev.equalsIgnoreCase(recommendation));
                
                if (isDuplicate) {
                    log.warn("Discarding exact duplicate recommendation: {}", recommendation);
                    continue;
                }
                
                // Same-response duplicate check
                boolean isSameResponseDuplicate = generated.stream()
                    .anyMatch(g -> g.getCategory().equals(catCode) && g.getRecommendation().contains(recommendation));
                
                if (isSameResponseDuplicate) {
                    continue;
                }
                
                String combinedRecommendation = recommendation;
                if (rationale != null) {
                    combinedRecommendation += "\n\nWhy this is recommended: " + rationale;
                }

                Recommendation rec = Recommendation.builder()
                        .userId(userId)
                        .category(catCode)
                        .recommendation(combinedRecommendation)
                        .estimatedReductionKgco2e(null) // Deprecated AI generated CO2 estimates
                        .isRead(false)
                        .build();
                generated.add(rec);
            }
        } catch (Exception e) {
            log.error("Failed to parse or fetch AI recommendations, using fallback", e);
            generated = getFallbackRecommendations(userId);
        }
        
        if (!generated.isEmpty()) {
            recommendationRepository.deleteByUserId(userId);
            generated = recommendationRepository.saveAll(generated);
        }
        
        try {
            com.ecotrack.ai.history.AiGenerationHistory history = new com.ecotrack.ai.history.AiGenerationHistory();
            history.setUserId(userId);
            history.setContentType(com.ecotrack.ai.history.AiGenerationHistory.ContentType.RECOMMENDATION);
            history.setTitle("AI Recommendation");
            
            List<RecommendationDTO> dtoList = generated.stream().map(this::mapToDTO).collect(Collectors.toList());
            history.setContentJson(objectMapper.writeValueAsString(dtoList));
            
            history.setModelUsed("spring.ai.openai.chat.options.model"); // since it's default chat client
            history.setGenerationSource("MANUAL");
            history.setGeneratedAt(LocalDateTime.now());
            historyRepository.save(history);
        } catch (Exception e) {
            log.warn("Failed to persist AI history for recommendations, user {}", userId, e);
        }

        return generated.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private List<Recommendation> getFallbackRecommendations(Long userId) {
        return List.of(
            Recommendation.builder().userId(userId).category("TRANSPORTATION").recommendation("Use public transit").estimatedReductionKgco2e(null).isRead(false).build(),
            Recommendation.builder().userId(userId).category("FOOD").recommendation("Eat one plant-based meal").estimatedReductionKgco2e(null).isRead(false).build(),
            Recommendation.builder().userId(userId).category("ELECTRICITY").recommendation("Turn off unused lights").estimatedReductionKgco2e(null).isRead(false).build()
        );
    }

    @Transactional(readOnly = true)
    public Page<RecommendationDTO> getRecommendations(Long userId, Pageable pageable) {
        return recommendationRepository.findByUserId(userId, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public void markAsRead(Long userId, Long recommendationId) {
        Recommendation rec = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found"));
        if (!rec.getUserId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not owner");
        }
        rec.setIsRead(true);
        recommendationRepository.save(rec);
    }

    private RecommendationDTO mapToDTO(Recommendation r) {
        return RecommendationDTO.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .category(r.getCategory())
                .recommendation(r.getRecommendation())
                .estimatedReductionKgco2e(r.getEstimatedReductionKgco2e())
                .isRead(r.getIsRead())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
