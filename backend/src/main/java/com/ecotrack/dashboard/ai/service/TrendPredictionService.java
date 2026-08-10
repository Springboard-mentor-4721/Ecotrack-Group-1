package com.ecotrack.dashboard.ai.service;

import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.dashboard.ai.dto.TrendPredictionContext;
import com.ecotrack.dashboard.ai.dto.TrendPredictionResponse;
import com.ecotrack.dashboard.sustainability.dto.TrendMetrics;
import com.ecotrack.dashboard.sustainability.service.SustainabilityMetricsService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TrendPredictionService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TrendPredictionService.class);

    private final SustainabilityMetricsService metricsService;
    private final EcoTrackAiProperties aiProperties;

    public TrendPredictionService(SustainabilityMetricsService metricsService, EcoTrackAiProperties aiProperties) {
        this.metricsService = metricsService;
        this.aiProperties = aiProperties;
    }

    public TrendPredictionResponse getOrGenerate(Long userId, TrendPredictionContext context) {
        try {
            TrendMetrics metrics = metricsService.calculateTrend(userId, LocalDate.now(), 30);
            
            TrendPredictionResponse.TrendDirection direction = TrendPredictionResponse.TrendDirection.STABLE;
            if ("IMPROVING".equals(metrics.direction())) direction = TrendPredictionResponse.TrendDirection.IMPROVING;
            if ("WORSENING".equals(metrics.direction())) direction = TrendPredictionResponse.TrendDirection.WORSENING;
            
            String explanation = "Your emissions changed by " + metrics.percentageChange().setScale(1) + "% compared to the previous period.";
            String recommendation = "Continue tracking to refine this deterministic calculation. Click 'Explain' for AI insights.";
            
            return new TrendPredictionResponse(
                List.of(), 
                direction,
                TrendPredictionResponse.Confidence.HIGH,
                explanation,
                recommendation
            );
        } catch (Exception e) {
            log.warn("Deterministic trend calculation failed for user {}: {}", userId, e.getMessage());
            return fallbackTrend();
        }
    }

    public void scheduledGenerate(Long userId, TrendPredictionContext context) {
        // Scheduler generation removed in Phase B to prevent background API limits.
    }

    private TrendPredictionResponse fallbackTrend() {
        return new TrendPredictionResponse(
            List.of(),
            TrendPredictionResponse.TrendDirection.STABLE,
            TrendPredictionResponse.Confidence.LOW,
            "We need a bit more data to calculate your carbon trend this week.",
            "Keep logging daily to build your carbon history."
        );
    }
}
