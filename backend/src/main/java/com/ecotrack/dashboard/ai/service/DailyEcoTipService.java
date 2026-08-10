package com.ecotrack.dashboard.ai.service;

import com.ecotrack.ai.client.AiClientPort;
import com.ecotrack.ai.client.AiCallOptions;
import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.ai.parser.AiResponseValidator;
import com.ecotrack.ai.parser.AiJsonCodec;
import com.ecotrack.ai.cache.AiInsightCache;
import com.ecotrack.ai.cache.AiInsightCacheRepository;
import com.ecotrack.dashboard.ai.dto.EcoTipContext;
import com.ecotrack.dashboard.ai.dto.EcoTipResponse;
import com.ecotrack.dashboard.ai.prompt.EcoTipPromptBuilder;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class DailyEcoTipService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DailyEcoTipService.class);

    private final AiClientPort aiClientPort;
    private final EcoTrackAiProperties aiProperties;
    private final EcoTipPromptBuilder promptBuilder;
    private final AiResponseValidator validator;
    private final AiInsightCacheRepository cacheRepository;
    private final AiJsonCodec codec;

    public DailyEcoTipService(AiClientPort aiClientPort,
                              EcoTrackAiProperties aiProperties,
                              EcoTipPromptBuilder promptBuilder,
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

    public EcoTipResponse getOrGenerate(Long userId, EcoTipContext context) {
        if (!aiProperties.enabled()) return fallbackTip();
        
        String today = LocalDate.now().toString();
        Optional<AiInsightCache> cached = cacheRepository.findFresh(userId, AiInsightCache.InsightType.DAILY_TIP, today, LocalDateTime.now());
        if (cached.isPresent()) {
            return codec.deserialize(cached.get().getPayloadJson(), EcoTipResponse.class);
        }

        // Trigger Gemini lazily from GET /api/dashboard/eco-tip
        return generateAndCache(userId, today, AiInsightCache.GenerationSource.LAZY, context);
    }

    public void scheduledGenerate(Long userId, EcoTipContext context) {
        if (!aiProperties.enabled()) return;
        String today = LocalDate.now().toString();
        if (cacheRepository.findFresh(userId, AiInsightCache.InsightType.DAILY_TIP, today, LocalDateTime.now()).isEmpty()) {
            generateAndCache(userId, today, AiInsightCache.GenerationSource.SCHEDULED, context);
        }
    }

    private EcoTipResponse generateAndCache(Long userId, String today, AiInsightCache.GenerationSource source, EcoTipContext context) {
        try {
            Prompt prompt = promptBuilder.build(context);
            AiCallOptions options = new AiCallOptions(
                    aiProperties.models().dailyTip(),
                    0.4,
                    100,
                    aiProperties.timeouts().callSeconds()
            );
            EcoTipResponse response = aiClientPort.generateStructured(prompt, EcoTipResponse.class, options);
            validator.validate(response);
            
            saveCacheEntry(userId, today, response, aiProperties.models().dailyTip(),
                    LocalDateTime.now().plusHours(aiProperties.cache().dailyTipTtlHours()), source);
            return response;
        } catch (Exception e) {
            log.warn("Eco tip generation failed for user {}: {}", userId, e.getMessage());
            return fallbackTip();
        }
    }

    private void saveCacheEntry(Long userId, String refKey, EcoTipResponse response, String model, LocalDateTime expiresAt, AiInsightCache.GenerationSource source) {
        try {
            AiInsightCache cacheEntry = new AiInsightCache();
            cacheEntry.setUserId(userId);
            cacheEntry.setInsightType(AiInsightCache.InsightType.DAILY_TIP);
            cacheEntry.setReferenceKey(refKey);
            cacheEntry.setPayloadJson(codec.serialize(response));
            cacheEntry.setModelUsed(model);
            cacheEntry.setGeneratedAt(LocalDateTime.now());
            cacheEntry.setExpiresAt(expiresAt);
            cacheEntry.setGenerationSource(source);
            
            Optional<AiInsightCache> existing = cacheRepository.findByUserIdAndInsightTypeAndReferenceKey(userId, AiInsightCache.InsightType.DAILY_TIP, refKey);
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

    private EcoTipResponse fallbackTip() {
        return new EcoTipResponse("Small swaps add up — try one meat-free meal this week to lower your footprint.", null);
    }
}
