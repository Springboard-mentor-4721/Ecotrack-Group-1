package com.ecotrack.dashboard.ai.service;

import com.ecotrack.ai.client.AiClientPort;
import com.ecotrack.ai.client.AiCallOptions;
import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.ai.parser.AiResponseValidator;
import com.ecotrack.ai.parser.AiJsonCodec;
import com.ecotrack.ai.cache.AiInsightCache;
import com.ecotrack.ai.cache.AiInsightCacheRepository;
import com.ecotrack.dashboard.ai.dto.TrendPredictionContext;
import com.ecotrack.dashboard.ai.dto.TrendPredictionResponse;
import com.ecotrack.dashboard.ai.prompt.TrendPredictionPromptBuilder;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TrendPredictionService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TrendPredictionService.class);

    private final AiClientPort aiClientPort;
    private final EcoTrackAiProperties aiProperties;
    private final TrendPredictionPromptBuilder promptBuilder;
    private final AiResponseValidator validator;
    private final AiInsightCacheRepository cacheRepository;
    private final AiJsonCodec codec;

    public TrendPredictionService(AiClientPort aiClientPort,
                                  EcoTrackAiProperties aiProperties,
                                  TrendPredictionPromptBuilder promptBuilder,
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

    public TrendPredictionResponse getOrGenerate(Long userId, TrendPredictionContext context) {
        if (!aiProperties.enabled()) return fallbackTrend();
        
        String today = LocalDate.now().toString();
        Optional<AiInsightCache> cached = cacheRepository.findFresh(userId, AiInsightCache.InsightType.TREND_PREDICTION, today);
        if (cached.isPresent()) {
            return codec.deserialize(cached.get().getPayloadJson(), TrendPredictionResponse.class);
        }

        return generateAndCache(userId, today, AiInsightCache.GenerationSource.LAZY, context);
    }

    public void scheduledGenerate(Long userId, TrendPredictionContext context) {
        if (!aiProperties.enabled()) return;
        String today = LocalDate.now().toString();
        if (cacheRepository.findFresh(userId, AiInsightCache.InsightType.TREND_PREDICTION, today).isEmpty()) {
            generateAndCache(userId, today, AiInsightCache.GenerationSource.SCHEDULED, context);
        }
    }

    private TrendPredictionResponse generateAndCache(Long userId, String today, AiInsightCache.GenerationSource source, TrendPredictionContext context) {
        try {
            Prompt prompt = promptBuilder.build(context);
            AiCallOptions options = new AiCallOptions(
                    aiProperties.models().trendPrediction(),
                    0.2,
                    200,
                    aiProperties.timeouts().callSeconds()
            );
            TrendPredictionResponse response = aiClientPort.generateStructured(prompt, TrendPredictionResponse.class, options);
            validator.validate(response);
            
            saveCacheEntry(userId, today, response, aiProperties.models().trendPrediction(),
                    LocalDateTime.now().plusHours(aiProperties.cache().trendPredictionTtlHours()), source);
            return response;
        } catch (Exception e) {
            log.warn("Trend prediction generation failed for user {}: {}", userId, e.getMessage());
            return fallbackTrend();
        }
    }

    private void saveCacheEntry(Long userId, String refKey, TrendPredictionResponse response, String model, LocalDateTime expiresAt, AiInsightCache.GenerationSource source) {
        try {
            AiInsightCache cacheEntry = new AiInsightCache();
            cacheEntry.setUserId(userId);
            cacheEntry.setInsightType(AiInsightCache.InsightType.TREND_PREDICTION);
            cacheEntry.setReferenceKey(refKey);
            cacheEntry.setPayloadJson(codec.serialize(response));
            cacheEntry.setModelUsed(model);
            cacheEntry.setGeneratedAt(LocalDateTime.now());
            cacheEntry.setExpiresAt(expiresAt);
            cacheEntry.setGenerationSource(source);
            
            Optional<AiInsightCache> existing = cacheRepository.findByUserIdAndInsightTypeAndReferenceKey(userId, AiInsightCache.InsightType.TREND_PREDICTION, refKey);
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

    private TrendPredictionResponse fallbackTrend() {
        return new TrendPredictionResponse(
            java.util.List.of(),
            TrendPredictionResponse.TrendDirection.STABLE,
            TrendPredictionResponse.Confidence.LOW,
            "We need a bit more data to confidently predict your carbon trend this week.",
            "Keep logging daily to build your carbon history."
        );
    }
}
