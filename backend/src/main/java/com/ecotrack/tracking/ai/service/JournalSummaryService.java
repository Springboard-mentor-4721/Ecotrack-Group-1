package com.ecotrack.tracking.ai.service;

import com.ecotrack.ai.client.AiClientPort;
import com.ecotrack.ai.client.AiCallOptions;
import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.ai.parser.AiResponseValidator;
import com.ecotrack.ai.parser.AiJsonCodec;
import com.ecotrack.ai.cache.AiInsightCache;
import com.ecotrack.ai.cache.AiInsightCacheRepository;
import com.ecotrack.ai.history.AiGenerationHistory;
import com.ecotrack.ai.history.AiGenerationHistoryRepository;
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
    private final AiGenerationHistoryRepository historyRepository;
    private final AiJsonCodec codec;

    public JournalSummaryService(AiClientPort aiClientPort,
                                 EcoTrackAiProperties aiProperties,
                                 JournalSummaryPromptBuilder summaryPromptBuilder,
                                 AiResponseValidator validator,
                                 AiInsightCacheRepository cacheRepository,
                                 AiGenerationHistoryRepository historyRepository,
                                 AiJsonCodec codec) {
        this.aiClientPort = aiClientPort;
        this.aiProperties = aiProperties;
        this.summaryPromptBuilder = summaryPromptBuilder;
        this.validator = validator;
        this.cacheRepository = cacheRepository;
        this.historyRepository = historyRepository;
        this.codec = codec;
    }

    public Optional<JournalSummaryResponse> getLatestSummary(Long userId, String cacheKey) {
        Optional<AiInsightCache> cached = cacheRepository.findFresh(userId, AiInsightCache.InsightType.JOURNAL_SUMMARY, cacheKey, LocalDateTime.now());
        if (cached.isPresent()) {
            return Optional.of(codec.deserialize(cached.get().getPayloadJson(), JournalSummaryResponse.class));
        }
        return Optional.empty();
    }

    public JournalSummaryResponse generateJournalSummary(Long userId, String cacheKey, String timeframe, JournalSummaryContext context) {
        if (!aiProperties.enabled() || !aiProperties.features().journalSummaryEnabled()) {
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
                           LocalDateTime.now().plusDays(ttlDays), AiInsightCache.GenerationSource.MANUAL);
            saveHistoryEntry(userId, cacheKey, response, aiProperties.models().journalSummary());
            
            return response;
        } catch (Exception e) {
            log.warn("Journal summary generation failed for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to generate AI journal summary", e);
        }
    }

    private void saveHistoryEntry(Long userId, String refKey, JournalSummaryResponse response, String model) {
        try {
            AiGenerationHistory history = new AiGenerationHistory();
            history.setUserId(userId);
            history.setContentType(AiGenerationHistory.ContentType.JOURNAL_SUMMARY);
            history.setTitle("AI Journal");
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
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.debug("Concurrent save constraint violation, ignoring: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Failed to save AI journal summary cache", e);
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
