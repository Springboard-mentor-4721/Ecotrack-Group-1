package com.ecotrack.dashboard.ai.service;

import com.ecotrack.ai.cache.AiInsightCache;
import com.ecotrack.ai.cache.AiInsightCacheRepository;
import com.ecotrack.ai.client.AiClientPort;
import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.ai.parser.AiJsonCodec;
import com.ecotrack.ai.parser.AiResponseValidator;
import com.ecotrack.dashboard.ai.dto.EcoTipContext;
import com.ecotrack.dashboard.ai.dto.EcoTipResponse;
import com.ecotrack.dashboard.ai.prompt.EcoTipPromptBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.prompt.Prompt;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DailyEcoTipServiceTest {

    @Mock private AiClientPort aiClientPort;
    @Mock private EcoTrackAiProperties aiProperties;
    @Mock private EcoTipPromptBuilder promptBuilder;
    @Mock private AiResponseValidator validator;
    @Mock private AiInsightCacheRepository cacheRepository;
    @Mock private AiJsonCodec codec;
    @Mock private EcoTrackAiProperties.Models models;
    @Mock private EcoTrackAiProperties.Timeouts timeouts;
    @Mock private EcoTrackAiProperties.Cache cache;

    private DailyEcoTipService service;

    @BeforeEach
    void setUp() {
        service = new DailyEcoTipService(aiClientPort, aiProperties, promptBuilder, validator, cacheRepository, codec);
    }

    @Test
    void whenAiDisabled_thenReturnFallback() {
        when(aiProperties.enabled()).thenReturn(false);
        EcoTipResponse response = service.getOrGenerate(1L, new EcoTipContext(""));
        assertEquals("Small swaps add up — try one meat-free meal this week to lower your footprint.", response.tipText());
        verifyNoInteractions(aiClientPort, cacheRepository);
    }

    @Test
    void whenCacheHit_thenReturnCachedResult() {
        when(aiProperties.enabled()).thenReturn(true);
        String today = LocalDate.now().toString();
        AiInsightCache cacheEntry = new AiInsightCache();
        cacheEntry.setPayloadJson("{\"tip\":\"cached tip\"}");
        
        when(cacheRepository.findFresh(eq(1L), eq(AiInsightCache.InsightType.DAILY_TIP), eq(today), any()))
                .thenReturn(Optional.of(cacheEntry));
        when(codec.deserialize("{\"tip\":\"cached tip\"}", EcoTipResponse.class))
                .thenReturn(new EcoTipResponse("cached tip", null));
                
        EcoTipResponse response = service.getOrGenerate(1L, new EcoTipContext(""));
        assertEquals("cached tip", response.tipText());
        verifyNoInteractions(aiClientPort);
    }

    @Test
    void whenCacheMiss_thenGenerateAndCache() {
        when(aiProperties.enabled()).thenReturn(true);
        when(aiProperties.models()).thenReturn(models);
        when(aiProperties.timeouts()).thenReturn(timeouts);
        when(aiProperties.cache()).thenReturn(cache);
        when(models.dailyTip()).thenReturn("gemini-flash");
        when(timeouts.callSeconds()).thenReturn(5);
        when(cache.dailyTipTtlHours()).thenReturn(24);
        
        String today = LocalDate.now().toString();
        when(cacheRepository.findFresh(eq(1L), eq(AiInsightCache.InsightType.DAILY_TIP), eq(today), any()))
                .thenReturn(Optional.empty());
                
        EcoTipResponse generated = new EcoTipResponse("generated tip", null);
        when(promptBuilder.build(any())).thenReturn(new Prompt("prompt"));
        when(aiClientPort.generateStructured(any(), eq(EcoTipResponse.class), any())).thenReturn(generated);
        when(codec.serialize(generated)).thenReturn("{}");
                
        EcoTipResponse response = service.getOrGenerate(1L, new EcoTipContext(""));
        assertEquals("generated tip", response.tipText());
        verify(cacheRepository).save(any(AiInsightCache.class));
    }

    @Test
    void scheduledGenerate_whenCacheMiss_thenGenerateAndCache() {
        when(aiProperties.enabled()).thenReturn(true);
        when(aiProperties.models()).thenReturn(models);
        when(aiProperties.timeouts()).thenReturn(timeouts);
        when(aiProperties.cache()).thenReturn(cache);
        when(models.dailyTip()).thenReturn("gemini-flash");
        when(timeouts.callSeconds()).thenReturn(5);
        when(cache.dailyTipTtlHours()).thenReturn(24);
        
        String today = LocalDate.now().toString();
        when(cacheRepository.findFresh(eq(1L), eq(AiInsightCache.InsightType.DAILY_TIP), eq(today), any()))
                .thenReturn(Optional.empty());
                
        EcoTipResponse generated = new EcoTipResponse("generated tip", null);
        when(promptBuilder.build(any())).thenReturn(new Prompt("prompt"));
        when(aiClientPort.generateStructured(any(), eq(EcoTipResponse.class), any())).thenReturn(generated);
        when(codec.serialize(generated)).thenReturn("{}");
        
        service.scheduledGenerate(1L, new EcoTipContext(""));
        verify(cacheRepository).save(any(AiInsightCache.class));
    }
}
