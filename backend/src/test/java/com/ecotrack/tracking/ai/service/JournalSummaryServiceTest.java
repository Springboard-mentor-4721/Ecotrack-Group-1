package com.ecotrack.tracking.ai.service;

import com.ecotrack.ai.client.AiClientPort;
import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.ai.parser.AiResponseValidator;
import com.ecotrack.ai.cache.AiInsightCacheRepository;
import com.ecotrack.ai.parser.AiJsonCodec;
import com.ecotrack.ai.history.AiGenerationHistoryRepository;
import com.ecotrack.tracking.ai.dto.JournalSummaryContext;
import com.ecotrack.tracking.ai.dto.JournalSummaryResponse;
import com.ecotrack.tracking.ai.prompt.JournalSummaryPromptBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

class JournalSummaryServiceTest {

    private JournalSummaryService service;
    private AiClientPort aiClientPort;
    private EcoTrackAiProperties aiProperties;
    private AiInsightCacheRepository cacheRepository;
    private AiGenerationHistoryRepository historyRepository;
    private AiJsonCodec codec;

    @BeforeEach
    void setUp() {
        aiClientPort = Mockito.mock(AiClientPort.class);
        
        EcoTrackAiProperties.Features features = new EcoTrackAiProperties.Features(true, true, true);
        EcoTrackAiProperties.Models models = new EcoTrackAiProperties.Models("gemini", "gemini", "gemini", "gemini", "gemini", "gemini");
        EcoTrackAiProperties.Timeouts timeouts = new EcoTrackAiProperties.Timeouts(8, 1);
        EcoTrackAiProperties.Cache cache = new EcoTrackAiProperties.Cache(24, 24, 7, 30, 7, 24);
        EcoTrackAiProperties.RateLimit rateLimit = new EcoTrackAiProperties.RateLimit(10);
        EcoTrackAiProperties.ManualRateLimit manualRateLimit = new EcoTrackAiProperties.ManualRateLimit(true, 3);
        aiProperties = new EcoTrackAiProperties(true, features, models, timeouts, cache, rateLimit, manualRateLimit);

        JournalSummaryPromptBuilder promptBuilder = Mockito.mock(JournalSummaryPromptBuilder.class);
        AiResponseValidator validator = Mockito.mock(AiResponseValidator.class);
        cacheRepository = Mockito.mock(AiInsightCacheRepository.class);
        historyRepository = Mockito.mock(AiGenerationHistoryRepository.class);
        codec = Mockito.mock(AiJsonCodec.class);

        service = new JournalSummaryService(aiClientPort, aiProperties, promptBuilder, validator, cacheRepository, historyRepository, codec);
    }

    @Test
    void testGenerateJournalSummary_Success() {
        JournalSummaryContext context = new JournalSummaryContext("weekly", "some data");
        JournalSummaryResponse mockResponse = new JournalSummaryResponse("Summary", "Trend", "Action", JournalSummaryResponse.OverallProgress.IMPROVING, List.of());
        
        when(aiClientPort.generateStructured(any(), any(), any())).thenReturn(mockResponse);

        JournalSummaryResponse response = service.generateJournalSummary(1L, "key", "weekly", context);

        assertNotNull(response);
        assertEquals("Summary", response.summaryText());
        verify(aiClientPort, times(1)).generateStructured(any(), any(), any());
    }

    @Test
    void testGetLatestSummary_NotFound() {
        when(cacheRepository.findFresh(any(), any(), any(), any()))
                .thenReturn(Optional.empty());

        Optional<JournalSummaryResponse> response = service.getLatestSummary(1L, "key");
        assertEquals(Optional.empty(), response);
        verify(aiClientPort, times(0)).generateStructured(any(), any(), any());
    }
}
