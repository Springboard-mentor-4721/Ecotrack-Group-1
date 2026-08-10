package com.ecotrack.tracking.ai.service;

import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.ai.parser.AiJsonCodec;
import com.ecotrack.ai.cache.AiInsightCacheRepository;
import com.ecotrack.tracking.ai.dto.SmartSuggestionContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class SmartSuggestionServiceTest {

    private SmartSuggestionService smartSuggestionService;
    private AiInsightCacheRepository cacheRepository;

    @BeforeEach
    void setUp() {
        EcoTrackAiProperties aiProperties = Mockito.mock(EcoTrackAiProperties.class);
        cacheRepository = Mockito.mock(AiInsightCacheRepository.class);
        AiJsonCodec codec = Mockito.mock(AiJsonCodec.class);
        
        smartSuggestionService = new SmartSuggestionService(aiProperties, cacheRepository, codec);
    }

    @Test
    void testDeterministicSuggestion_Transport() {
        SmartSuggestionContext context = new SmartSuggestionContext("Transport", 10.0, "Driving");
        smartSuggestionService.generateSmartSuggestionAsync(1L, 100L, context).join();
        
        Mockito.verify(cacheRepository, Mockito.atLeastOnce()).save(Mockito.any());
    }
}
