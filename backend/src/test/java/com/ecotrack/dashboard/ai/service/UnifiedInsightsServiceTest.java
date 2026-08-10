package com.ecotrack.dashboard.ai.service;

import com.ecotrack.ai.client.AiClientPort;
import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.ai.parser.AiResponseValidator;
import com.ecotrack.ai.cache.AiInsightCacheRepository;
import com.ecotrack.ai.parser.AiJsonCodec;
import com.ecotrack.dashboard.ai.dto.AiInsightsResponse;
import com.ecotrack.dashboard.ai.prompt.UnifiedInsightsPromptBuilder;
import com.ecotrack.dashboard.sustainability.dto.BehaviorMetrics;
import com.ecotrack.dashboard.sustainability.dto.TrendMetrics;
import com.ecotrack.dashboard.sustainability.service.SustainabilityMetricsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import com.ecotrack.ai.history.AiGenerationHistoryRepository;
import com.ecotrack.tracking.service.CarbonEntryService;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

class UnifiedInsightsServiceTest {

    private UnifiedInsightsService service;
    private SustainabilityMetricsService metricsService;
    private AiClientPort aiClientPort;
    private EcoTrackAiProperties aiProperties;

    @BeforeEach
    void setUp() {
        metricsService = Mockito.mock(SustainabilityMetricsService.class);
        aiClientPort = Mockito.mock(AiClientPort.class);
        
        EcoTrackAiProperties.Features features = new EcoTrackAiProperties.Features(true, true, true);
        EcoTrackAiProperties.Models models = new EcoTrackAiProperties.Models("","","","","","");
        EcoTrackAiProperties.Timeouts timeouts = new EcoTrackAiProperties.Timeouts(8, 1);
        EcoTrackAiProperties.Cache cache = new EcoTrackAiProperties.Cache(24, 24, 7, 30, 7, 24);
        EcoTrackAiProperties.RateLimit rateLimit = new EcoTrackAiProperties.RateLimit(10);
        EcoTrackAiProperties.ManualRateLimit manualRateLimit = new EcoTrackAiProperties.ManualRateLimit(true, 3);
        aiProperties = new EcoTrackAiProperties(true, features, models, timeouts, cache, rateLimit, manualRateLimit);

        UnifiedInsightsPromptBuilder promptBuilder = Mockito.mock(UnifiedInsightsPromptBuilder.class);
        AiResponseValidator validator = Mockito.mock(AiResponseValidator.class);
        AiInsightCacheRepository cacheRepository = Mockito.mock(AiInsightCacheRepository.class);
        AiJsonCodec codec = Mockito.mock(AiJsonCodec.class);
        AiGenerationHistoryRepository historyRepository = Mockito.mock(AiGenerationHistoryRepository.class);
        CarbonEntryService carbonEntryService = Mockito.mock(CarbonEntryService.class);

        service = new UnifiedInsightsService(metricsService, aiClientPort, aiProperties, promptBuilder, validator, cacheRepository, historyRepository, codec, carbonEntryService);
    }

    @Test
    void testGenerateInsight_Success() {
        TrendMetrics trend = new TrendMetrics(BigDecimal.TEN, BigDecimal.ONE, BigDecimal.TEN, "IMPROVING", BigDecimal.ONE);
        BehaviorMetrics behavior = new BehaviorMetrics(List.of(), List.of(), "Transport", List.of());
        when(metricsService.calculateTrend(any(), any(), any(Integer.class))).thenReturn(trend);
        when(metricsService.calculateBehavior(any(), any(), any(Integer.class))).thenReturn(behavior);

        AiInsightsResponse mockResponse = new AiInsightsResponse("Summary", "Trend", List.of(), List.of(), List.of(), "HIGH");
        when(aiClientPort.generateStructured(any(), any(), any())).thenReturn(mockResponse);

        AiInsightsResponse response = service.generateInsight(1L);

        assertNotNull(response);
        assertEquals("Summary", response.summary());
        verify(aiClientPort, times(1)).generateStructured(any(), any(), any());
    }

    @Test
    void testGenerateInsight_Disabled() {
        EcoTrackAiProperties disabledProps = new EcoTrackAiProperties(false, aiProperties.features(), aiProperties.models(), aiProperties.timeouts(), aiProperties.cache(), aiProperties.rateLimit(), aiProperties.manualRateLimit());
        UnifiedInsightsService disabledService = new UnifiedInsightsService(metricsService, aiClientPort, disabledProps, null, null, null, null, null, null);

        AiInsightsResponse response = disabledService.generateInsight(1L);

        assertEquals("We cannot generate your AI insight at this moment.", response.summary());
        verify(aiClientPort, times(0)).generateStructured(any(), any(), any());
    }
}
