package com.ecotrack.tracking.ai.service;

import com.ecotrack.ai.client.AiClientPort;
import com.ecotrack.ai.client.AiCallOptions;
import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.ai.parser.AiResponseValidator;
import com.ecotrack.ai.parser.AiJsonCodec;
import com.ecotrack.ai.cache.AiInsightCache;
import com.ecotrack.ai.cache.AiInsightCacheRepository;
import com.ecotrack.tracking.ai.dto.JournalSummaryContext;
import com.ecotrack.tracking.ai.dto.JournalSummaryResponse;
import com.ecotrack.tracking.ai.prompt.JournalSummaryPromptBuilder;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Service
public class JournalSummaryService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(JournalSummaryService.class);

    private final AiClientPort aiClientPort;
    private final EcoTrackAiProperties aiProperties;
    private final JournalSummaryPromptBuilder summaryPromptBuilder;
    private final AiResponseValidator validator;
    private final AiInsightCacheRepository cacheRepository;
    private final AiJsonCodec codec;

    public JournalSummaryService(AiClientPort aiClientPort,
                                 EcoTrackAiProperties aiProperties,
                                 JournalSummaryPromptBuilder summaryPromptBuilder,
                                 AiResponseValidator validator,
                                 AiInsightCacheRepository cacheRepository,
                                 AiJsonCodec codec) {
        this.aiClientPort = aiClientPort;
        this.aiProperties = aiProperties;
        this.summaryPromptBuilder = summaryPromptBuilder;
        this.validator = validator;
        this.cacheRepository = cacheRepository;
        this.codec = codec;
    }

    public JournalSummaryResponse generateJournalSummary(Long userId, String cacheKey, String timeframe, JournalSummaryContext context) {
        if (!aiProperties.enabled()) {
            return fallbackSummary();
        }
        
        if (context.journalData() == null || context.journalData().trim().isEmpty()) {
            return new JournalSummaryResponse(
                "You haven't logged any carbon entries for this period. Start logging to receive AI summaries of your eco habits!",
                "N/A",
                "N/A",
                JournalSummaryResponse.OverallProgress.INSUFFICIENT_DATA,
                List.of("Start logging your daily transport, meals, and home energy consumption.")
            );
        }
        
        Optional<AiInsightCache> cached = cacheRepository.findFresh(userId, AiInsightCache.InsightType.JOURNAL_SUMMARY, cacheKey);
        if (cached.isPresent()) {
            return codec.deserialize(cached.get().getPayloadJson(), JournalSummaryResponse.class);
        }

        try {
            Prompt prompt = summaryPromptBuilder.build(context);
            AiCallOptions options = new AiCallOptions(
                    aiProperties.models().journalSummary(),
                    0.2,
                    400,
                    aiProperties.timeouts().callSeconds()
            );
            JournalSummaryResponse response = aiClientPort.generateStructured(prompt, JournalSummaryResponse.class, options);
            validator.validate(response);
            
            int ttlDays = timeframe.equalsIgnoreCase("monthly") 
                    ? aiProperties.cache().journalSummaryMonthlyTtlDays() 
                    : aiProperties.cache().journalSummaryWeeklyTtlDays();
            
            saveCacheEntry(userId, cacheKey, response, aiProperties.models().journalSummary(),
                           LocalDateTime.now().plusDays(ttlDays), AiInsightCache.GenerationSource.LAZY);
            
            return response;
        } catch (Exception e) {
            log.warn("Journal summary generation failed for user {}: {}", userId, e.getMessage());
            return fallbackSummary();
        }
    }

    private void saveCacheEntry(Long userId, String refKey, JournalSummaryResponse response, String model, LocalDateTime expiresAt, AiInsightCache.GenerationSource source) {
        try {
            AiInsightCache cacheEntry = new AiInsightCache();
            cacheEntry.setUserId(userId);
            cacheEntry.setInsightType(AiInsightCache.InsightType.JOURNAL_SUMMARY);
            cacheEntry.setReferenceKey(refKey);
            cacheEntry.setPayloadJson(codec.serialize(response));
            cacheEntry.setModelUsed(model);
            cacheEntry.setGeneratedAt(LocalDateTime.now());
            cacheEntry.setExpiresAt(expiresAt);
            cacheEntry.setGenerationSource(source);
            
            Optional<AiInsightCache> existing = cacheRepository.findByUserIdAndInsightTypeAndReferenceKey(userId, AiInsightCache.InsightType.JOURNAL_SUMMARY, refKey);
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

    private JournalSummaryResponse fallbackSummary() {
        return new JournalSummaryResponse(
            "Consistent logging helps track your progress over time.",
            "N/A",
            "N/A",
            JournalSummaryResponse.OverallProgress.STABLE,
            List.of("Keep logging entries to get a detailed summary.")
        );
    }
}
