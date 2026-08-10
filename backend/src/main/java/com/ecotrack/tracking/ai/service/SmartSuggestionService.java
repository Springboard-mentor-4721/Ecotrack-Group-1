package com.ecotrack.tracking.ai.service;

import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.ai.parser.AiJsonCodec;
import com.ecotrack.ai.cache.AiInsightCache;
import com.ecotrack.ai.cache.AiInsightCacheRepository;
import com.ecotrack.tracking.ai.dto.SmartSuggestionContext;
import com.ecotrack.tracking.ai.dto.SmartSuggestionResponse;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

import java.util.concurrent.CompletableFuture;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class SmartSuggestionService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SmartSuggestionService.class);

    private final EcoTrackAiProperties aiProperties;
    private final AiInsightCacheRepository cacheRepository;
    private final AiJsonCodec codec;

    public SmartSuggestionService(EcoTrackAiProperties aiProperties,
                                  AiInsightCacheRepository cacheRepository,
                                  AiJsonCodec codec) {
        this.aiProperties = aiProperties;
        this.cacheRepository = cacheRepository;
        this.codec = codec;
    }

    @Async("aiTaskExecutor")
    public CompletableFuture<Void> generateSmartSuggestionAsync(Long userId, Long entryId, SmartSuggestionContext context) {
        try {
            SmartSuggestionResponse response;
            if (context.category() != null && context.category().toLowerCase().contains("transport")) {
                response = new SmartSuggestionResponse("Consider public transport or carpooling for similar trips.", SmartSuggestionResponse.ImpactLevel.HIGH, context.category());
            } else if (context.category() != null && context.category().toLowerCase().contains("energy")) {
                response = new SmartSuggestionResponse("Reducing high-energy appliance usage may lower your footprint.", SmartSuggestionResponse.ImpactLevel.MEDIUM, context.category());
            } else if (context.category() != null && context.category().toLowerCase().contains("water")) {
                response = new SmartSuggestionResponse("Shortening shower times can significantly reduce water and heating emissions.", SmartSuggestionResponse.ImpactLevel.MEDIUM, context.category());
            } else {
                response = new SmartSuggestionResponse("Small swaps add up. Try to find a greener alternative next time.", SmartSuggestionResponse.ImpactLevel.LOW, context.category());
            }
            
            saveCacheEntry(userId, String.valueOf(entryId),
                           response, "deterministic-rule-engine",
                           LocalDateTime.now().plusYears(100), AiInsightCache.GenerationSource.LAZY);
            
        } catch (Exception e) {
            log.warn("Failed to generate smart suggestion for entry {}: {}", entryId, e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }

    private void saveCacheEntry(Long userId, String refKey, SmartSuggestionResponse response, String model, LocalDateTime expiresAt, AiInsightCache.GenerationSource source) {
        try {
            AiInsightCache cacheEntry = new AiInsightCache();
            cacheEntry.setUserId(userId);
            cacheEntry.setInsightType(AiInsightCache.InsightType.SMART_SUGGESTION);
            cacheEntry.setReferenceKey(refKey);
            cacheEntry.setPayloadJson(codec.serialize(response));
            cacheEntry.setModelUsed(model);
            cacheEntry.setGeneratedAt(LocalDateTime.now());
            cacheEntry.setExpiresAt(expiresAt);
            cacheEntry.setGenerationSource(source);
            
            Optional<AiInsightCache> existing = cacheRepository.findByUserIdAndInsightTypeAndReferenceKey(userId, AiInsightCache.InsightType.SMART_SUGGESTION, refKey);
            if (existing.isPresent()) {
                AiInsightCache e = existing.get();
                e.setPayloadJson(cacheEntry.getPayloadJson());
                e.setModelUsed(cacheEntry.getModelUsed());
                e.setGeneratedAt(cacheEntry.getGeneratedAt());
                e.setExpiresAt(cacheEntry.getExpiresAt());
                e.setGenerationSource(cacheEntry.getGenerationSource());
                cacheRepository.save(e);
            } else {
                cacheRepository.save(cacheEntry);
            }
        } catch (Exception e) {
            // Ignore concurrent save constraint violation
        }
    }
}
