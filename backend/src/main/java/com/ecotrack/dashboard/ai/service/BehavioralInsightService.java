package com.ecotrack.dashboard.ai.service;

import com.ecotrack.ai.client.AiClientPort;
import com.ecotrack.ai.client.AiCallOptions;
import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.ai.parser.AiResponseValidator;
import com.ecotrack.ai.parser.AiJsonCodec;
import com.ecotrack.ai.cache.AiInsightCache;
import com.ecotrack.ai.cache.AiInsightCacheRepository;
import com.ecotrack.dashboard.ai.dto.BehavioralInsightsContext;
import com.ecotrack.dashboard.ai.dto.BehavioralInsightsResponse;
import com.ecotrack.dashboard.ai.prompt.BehavioralInsightsPromptBuilder;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Service
public class BehavioralInsightService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(BehavioralInsightService.class);

    private final AiClientPort aiClientPort;
    private final EcoTrackAiProperties aiProperties;
    private final BehavioralInsightsPromptBuilder promptBuilder;
    private final AiResponseValidator validator;
    private final AiInsightCacheRepository cacheRepository;
    private final AiJsonCodec codec;

    public BehavioralInsightService(AiClientPort aiClientPort,
                                    EcoTrackAiProperties aiProperties,
                                    BehavioralInsightsPromptBuilder promptBuilder,
                                    AiResponseValidator validator,
                                    AiInsightCacheRepository cacheRepository,
                                    AiJsonCodec codec) {
        this.aiClientPort = aiClientPort;
        this.aiProperties = aiProperties;
        this.promptBuilder = promptBuilder;
        this.validator = validator;
        this.cacheRepository = cacheRepository;
        this.codec = codec;
    }

    public BehavioralInsightsResponse getOrGenerate(Long userId, BehavioralInsightsContext context) {
        if (!aiProperties.enabled()) return fallbackInsight();
        
        String refKey = "latest";
        Optional<AiInsightCache> cached = cacheRepository.findFresh(userId, AiInsightCache.InsightType.BEHAVIORAL_INSIGHT, refKey);
        if (cached.isPresent()) {
            return codec.deserialize(cached.get().getPayloadJson(), BehavioralInsightsResponse.class);
        }

        return generateAndCache(userId, refKey, AiInsightCache.GenerationSource.LAZY, context);
    }

    public void scheduledGenerate(Long userId, BehavioralInsightsContext context) {
        if (!aiProperties.enabled()) return;
        String refKey = "latest";
        generateAndCache(userId, refKey, AiInsightCache.GenerationSource.SCHEDULED, context);
    }

    private BehavioralInsightsResponse generateAndCache(Long userId, String refKey, AiInsightCache.GenerationSource source, BehavioralInsightsContext context) {
        try {
            Prompt prompt = promptBuilder.build(context);
            AiCallOptions options = new AiCallOptions(
                    aiProperties.models().behavioralInsight(),
                    0.5,
                    400,
                    aiProperties.timeouts().callSeconds()
            );
            BehavioralInsightsResponse response = aiClientPort.generateStructured(prompt, BehavioralInsightsResponse.class, options);
            validator.validate(response);
            
            saveCacheEntry(userId, refKey, response, aiProperties.models().behavioralInsight(),
                    LocalDateTime.now().plusDays(aiProperties.cache().behavioralInsightTtlDays()), source);
            return response;
        } catch (Exception e) {
            log.warn("Behavioral insight generation failed for user {}: {}", userId, e.getMessage());
            return fallbackInsight();
        }
    }

    private void saveCacheEntry(Long userId, String refKey, BehavioralInsightsResponse response, String model, LocalDateTime expiresAt, AiInsightCache.GenerationSource source) {
        try {
            AiInsightCache cacheEntry = new AiInsightCache();
            cacheEntry.setUserId(userId);
            cacheEntry.setInsightType(AiInsightCache.InsightType.BEHAVIORAL_INSIGHT);
            cacheEntry.setReferenceKey(refKey);
            cacheEntry.setPayloadJson(codec.serialize(response));
            cacheEntry.setModelUsed(model);
            cacheEntry.setGeneratedAt(LocalDateTime.now());
            cacheEntry.setExpiresAt(expiresAt);
            cacheEntry.setGenerationSource(source);
            
            Optional<AiInsightCache> existing = cacheRepository.findByUserIdAndInsightTypeAndReferenceKey(userId, AiInsightCache.InsightType.BEHAVIORAL_INSIGHT, refKey);
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

    private BehavioralInsightsResponse fallbackInsight() {
        return new BehavioralInsightsResponse(List.of(
            new BehavioralInsightsResponse.Insight(
                "Consistently log your habits to unlock personalized behavioral insights.",
                "General",
                "Start logging your daily transport, meals, and home energy consumption.",
                BehavioralInsightsResponse.Insight.ImpactWeight.LOW
            )
        ));
    }
}
