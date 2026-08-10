package com.ecotrack.dashboard.sustainability.service;

import com.ecotrack.dashboard.sustainability.dto.BehaviorMetrics;
import com.ecotrack.dashboard.sustainability.dto.TrendMetrics;
import com.ecotrack.tracking.dto.CarbonSummaryResponse;
import com.ecotrack.tracking.dto.CategoryEmissionResponse;
import com.ecotrack.tracking.service.CarbonEntryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class SustainabilityMetricsServiceTest {

    private CarbonEntryService carbonEntryService;
    private SustainabilityMetricsService metricsService;

    @BeforeEach
    void setUp() {
        carbonEntryService = Mockito.mock(CarbonEntryService.class);
        metricsService = new SustainabilityMetricsService(carbonEntryService);
    }

    @Test
    void testCalculateTrend_Increasing() {
        LocalDate today = LocalDate.now();
        CarbonSummaryResponse current = new CarbonSummaryResponse();
        current.setTotalEmission(BigDecimal.valueOf(110));
        
        CarbonSummaryResponse previous = new CarbonSummaryResponse();
        previous.setTotalEmission(BigDecimal.valueOf(100));

        when(carbonEntryService.getDashboardSummary(eq(1L), any(LocalDate.class), eq(today))).thenReturn(current);
        when(carbonEntryService.getDashboardSummary(eq(1L), any(LocalDate.class), any(LocalDate.class))).thenAnswer(invocation -> {
            LocalDate end = invocation.getArgument(2);
            if (end.equals(today)) return current;
            return previous;
        });

        TrendMetrics trend = metricsService.calculateTrend(1L, today, 30);
        
        assertEquals("WORSENING", trend.direction());
        assertEquals(0, BigDecimal.valueOf(10).compareTo(trend.percentageChange()));
    }

    @Test
    void testCalculateTrend_Decreasing() {
        LocalDate today = LocalDate.now();
        CarbonSummaryResponse current = new CarbonSummaryResponse();
        current.setTotalEmission(BigDecimal.valueOf(90));
        
        CarbonSummaryResponse previous = new CarbonSummaryResponse();
        previous.setTotalEmission(BigDecimal.valueOf(100));

        when(carbonEntryService.getDashboardSummary(eq(1L), any(LocalDate.class), eq(today))).thenReturn(current);
        when(carbonEntryService.getDashboardSummary(eq(1L), any(LocalDate.class), any(LocalDate.class))).thenAnswer(invocation -> {
            LocalDate end = invocation.getArgument(2);
            if (end.equals(today)) return current;
            return previous;
        });

        TrendMetrics trend = metricsService.calculateTrend(1L, today, 30);
        
        assertEquals("IMPROVING", trend.direction());
        assertEquals(0, BigDecimal.valueOf(-10).compareTo(trend.percentageChange()));
    }
    
    @Test
    void testCalculateBehavior_DominantCategory() {
        LocalDate today = LocalDate.now();
        CarbonSummaryResponse summary = new CarbonSummaryResponse();
        summary.setTotalEmission(BigDecimal.valueOf(100));
        summary.setCategorySummaries(List.of(
            new CategoryEmissionResponse("Transport", BigDecimal.valueOf(60), BigDecimal.valueOf(60))
        ));

        when(carbonEntryService.getDashboardSummary(eq(1L), any(), eq(today))).thenReturn(summary);

        BehaviorMetrics metrics = metricsService.calculateBehavior(1L, today, 30);
        
        assertEquals("Transport", metrics.dominantCategory());
        assertTrue(metrics.concerningPatterns().get(0).contains("over 50%"));
    }
}
