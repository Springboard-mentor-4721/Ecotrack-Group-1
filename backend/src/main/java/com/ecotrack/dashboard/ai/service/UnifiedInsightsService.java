package com.ecotrack.dashboard.ai.service;

import com.ecotrack.ai.client.AiClientPort;
import com.ecotrack.ai.client.AiCallOptions;
import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.ai.parser.AiResponseValidator;
import com.ecotrack.ai.parser.AiJsonCodec;
import com.ecotrack.ai.cache.AiInsightCache;
import com.ecotrack.ai.cache.AiInsightCacheRepository;
import com.ecotrack.ai.history.AiGenerationHistory;
import com.ecotrack.ai.history.AiGenerationHistoryRepository;
import com.ecotrack.dashboard.ai.dto.AiInsightsResponse;
import com.ecotrack.dashboard.ai.dto.UnifiedInsightsContext;
import com.ecotrack.dashboard.ai.prompt.UnifiedInsightsPromptBuilder;
import com.ecotrack.dashboard.sustainability.dto.BehaviorMetrics;
import com.ecotrack.dashboard.sustainability.dto.TrendMetrics;
import com.ecotrack.dashboard.sustainability.service.SustainabilityMetricsService;
import com.ecotrack.tracking.service.CarbonEntryService;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UnifiedInsightsService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UnifiedInsightsService.class);

    private final SustainabilityMetricsService metricsService;
    private final AiClientPort aiClientPort;
    private final EcoTrackAiProperties aiProperties;
    private final UnifiedInsightsPromptBuilder promptBuilder;
    private final AiResponseValidator validator;
    private final AiInsightCacheRepository cacheRepository;
    private final AiGenerationHistoryRepository historyRepository;
    private final AiJsonCodec codec;
    private final CarbonEntryService carbonEntryService;

    public UnifiedInsightsService(SustainabilityMetricsService metricsService,
                                  AiClientPort aiClientPort,
                                  EcoTrackAiProperties aiProperties,
                                  UnifiedInsightsPromptBuilder promptBuilder,
                                  AiResponseValidator validator,
                                  AiInsightCacheRepository cacheRepository,
                                  AiGenerationHistoryRepository historyRepository,
                                  AiJsonCodec codec,
                                  CarbonEntryService carbonEntryService) {
        this.metricsService = metricsService;
        this.aiClientPort = aiClientPort;
        this.aiProperties = aiProperties;
        this.promptBuilder = promptBuilder;
        this.validator = validator;
        this.cacheRepository = cacheRepository;
        this.historyRepository = historyRepository;
        this.codec = codec;
        this.carbonEntryService = carbonEntryService;
    }

    public Optional<AiInsightsResponse> getLatestInsight(Long userId) {
        String refKey = LocalDate.now().toString() + "_v2"; // simple daily cache key for insights
        return cacheRepository.findFresh(userId, AiInsightCache.InsightType.AI_SUSTAINABILITY_INSIGHTS, refKey, LocalDateTime.now())
                .map(cache -> codec.deserialize(cache.getPayloadJson(), AiInsightsResponse.class));
    }

    public AiInsightsResponse generateInsight(Long userId) {
        if (!aiProperties.enabled() || !aiProperties.features().insightsEnabled()) {
            return fallbackInsight();
        }

        String refKey = LocalDate.now().toString() + "_v2";

        try {
            TrendMetrics trend = metricsService.calculateTrend(userId, LocalDate.now(), 30);
            BehaviorMetrics behavior = metricsService.calculateBehavior(userId, LocalDate.now(), 30);
            String rawJournalData = carbonEntryService.getRawJournalDataStringForUser(userId, LocalDate.now().minusDays(30), LocalDate.now());

            UnifiedInsightsContext context = new UnifiedInsightsContext(
                trend.currentPeriodEmission(),
                trend.previousPeriodEmission(),
                trend.percentageChange(),
                trend.direction(),
                behavior.dominantCategory(),
                behavior.concerningPatterns(),
                behavior.positivePatterns(),
                rawJournalData
            );

            Prompt prompt = promptBuilder.build(context);
            AiCallOptions options = new AiCallOptions(
                    aiProperties.models().unifiedInsights(),
                    0.4,
                    300,
                    aiProperties.timeouts().callSeconds()
            );

            AiInsightsResponse response = aiClientPort.generateStructured(prompt, AiInsightsResponse.class, options);
            validator.validate(response);

            saveCacheEntry(userId, refKey, response, aiProperties.models().unifiedInsights(),
                    LocalDateTime.now().plusHours(aiProperties.cache().unifiedInsightsTtlHours()));
            saveHistoryEntry(userId, refKey, response, aiProperties.models().unifiedInsights());

            return response;
        } catch (Exception e) {
            log.warn("Unified insight generation failed for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to generate AI insight", e);
        }
    }

    private void saveHistoryEntry(Long userId, String refKey, AiInsightsResponse response, String model) {
        try {
            AiGenerationHistory history = new AiGenerationHistory();
            history.setUserId(userId);
            history.setContentType(AiGenerationHistory.ContentType.SUSTAINABILITY_INSIGHT);
            history.setTitle("AI Sustainability Insight");
            history.setContentJson(codec.serialize(response));
            history.setModelUsed(model);
            history.setGenerationSource(AiInsightCache.GenerationSource.MANUAL.name());
            history.setReferenceKey(refKey);
            history.setGeneratedAt(LocalDateTime.now());
            historyRepository.save(history);
        } catch (Exception e) {
            log.warn("Failed to persist AI history for user {}", userId, e);
        }
    }

    private void saveCacheEntry(Long userId, String refKey, AiInsightsResponse response, String model, LocalDateTime expiresAt) {
        try {
            AiInsightCache cacheEntry = new AiInsightCache();
            cacheEntry.setUserId(userId);
            cacheEntry.setInsightType(AiInsightCache.InsightType.AI_SUSTAINABILITY_INSIGHTS);
            cacheEntry.setReferenceKey(refKey);
            cacheEntry.setPayloadJson(codec.serialize(response));
            cacheEntry.setModelUsed(model);
            cacheEntry.setGeneratedAt(LocalDateTime.now());
            cacheEntry.setExpiresAt(expiresAt);
            cacheEntry.setGenerationSource(AiInsightCache.GenerationSource.MANUAL);
            
            Optional<AiInsightCache> existing = cacheRepository.findByUserIdAndInsightTypeAndReferenceKey(userId, AiInsightCache.InsightType.AI_SUSTAINABILITY_INSIGHTS, refKey);
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
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.debug("Concurrent save constraint violation, ignoring: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Failed to save AI insight cache", e);
        }
    }

    private AiInsightsResponse fallbackInsight() {
        return new AiInsightsResponse(
            "We cannot generate your AI insight at this moment.",
            "Please check back later or continue logging your activities.",
            List.of("AI generation unavailable"),
            List.of(),
            List.of("Continue standard logging"),
            "MANUAL"
        );
    }
}
