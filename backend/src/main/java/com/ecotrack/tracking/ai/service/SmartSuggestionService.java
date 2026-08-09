package com.ecotrack.tracking.ai.service;

import com.ecotrack.ai.client.AiClientPort;
import com.ecotrack.ai.client.AiCallOptions;
import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.ai.parser.AiResponseValidator;
import com.ecotrack.ai.parser.AiJsonCodec;
import com.ecotrack.ai.cache.AiInsightCache;
import com.ecotrack.ai.cache.AiInsightCacheRepository;
import com.ecotrack.tracking.ai.dto.SmartSuggestionContext;
import com.ecotrack.tracking.ai.dto.SmartSuggestionResponse;
import com.ecotrack.tracking.ai.prompt.SmartSuggestionPromptBuilder;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

import java.util.concurrent.CompletableFuture;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class SmartSuggestionService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SmartSuggestionService.class);

    private final AiClientPort aiClientPort;
    private final EcoTrackAiProperties aiProperties;
    private final SmartSuggestionPromptBuilder suggestionPromptBuilder;
    private final AiResponseValidator validator;
    private final AiInsightCacheRepository cacheRepository;
    private final AiJsonCodec codec;

    public SmartSuggestionService(AiClientPort aiClientPort,
                                  EcoTrackAiProperties aiProperties,
                                  SmartSuggestionPromptBuilder suggestionPromptBuilder,
                                  AiResponseValidator validator,
                                  AiInsightCacheRepository cacheRepository,
                                  AiJsonCodec codec) {
        this.aiClientPort = aiClientPort;
        this.aiProperties = aiProperties;
        this.suggestionPromptBuilder = suggestionPromptBuilder;
        this.validator = validator;
        this.cacheRepository = cacheRepository;
        this.codec = codec;
    }

    @Async("aiTaskExecutor")
    public CompletableFuture<Void> generateSmartSuggestionAsync(Long userId, Long entryId, SmartSuggestionContext context) {
        if (!aiProperties.enabled()) {
            return CompletableFuture.completedFuture(null);
        }
        try {
            Prompt prompt = suggestionPromptBuilder.build(context);
            AiCallOptions options = new AiCallOptions(
                    aiProperties.models().smartSuggestion(),
                    0.3,
                    150,
                    aiProperties.timeouts().callSeconds()
            );
            SmartSuggestionResponse response = aiClientPort.generateStructured(prompt, SmartSuggestionResponse.class, options);
            validator.validate(response);
            
            saveCacheEntry(userId, String.valueOf(entryId),
                           response, aiProperties.models().smartSuggestion(),
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
