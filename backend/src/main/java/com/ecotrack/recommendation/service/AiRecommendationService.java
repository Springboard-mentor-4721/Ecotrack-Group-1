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
    
    // Check cooldown based on latest generated recommendation
    private void checkCooldown(Long userId) {
        List<Recommendation> recent = recommendationRepository.findByUserIdAndCreatedAtAfter(
                userId, LocalDateTime.now().minusHours(24));
        if (!recent.isEmpty()) {
            throw new RecommendationCooldownException("You can only generate recommendations once every 24 hours.");
        }
    }

    @Transactional
    public List<RecommendationDTO> generateRecommendations(Long userId) {
        checkCooldown(userId);
        
        UserContextDTO context = contextAssemblyService.assembleContext(userId);
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
                Recommendation rec = Recommendation.builder()
                        .userId(userId)
                        .category((String) map.get("category"))
                        .recommendation((String) map.get("recommendation"))
                        .estimatedReductionKgco2e(new BigDecimal(map.get("estimatedReduction").toString()))
                        .isRead(false)
                        .build();
                generated.add(rec);
            }
        } catch (Exception e) {
            log.error("Failed to parse or fetch AI recommendations, using fallback", e);
            generated = getFallbackRecommendations(userId);
        }
        
        generated = recommendationRepository.saveAll(generated);
        return generated.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private List<Recommendation> getFallbackRecommendations(Long userId) {
        return List.of(
            Recommendation.builder().userId(userId).category("TRANSPORT").recommendation("Use public transit").estimatedReductionKgco2e(new BigDecimal("2.5")).isRead(false).build(),
            Recommendation.builder().userId(userId).category("DIET").recommendation("Eat one plant-based meal").estimatedReductionKgco2e(new BigDecimal("1.2")).isRead(false).build(),
            Recommendation.builder().userId(userId).category("ENERGY").recommendation("Turn off unused lights").estimatedReductionKgco2e(new BigDecimal("0.5")).isRead(false).build()
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
