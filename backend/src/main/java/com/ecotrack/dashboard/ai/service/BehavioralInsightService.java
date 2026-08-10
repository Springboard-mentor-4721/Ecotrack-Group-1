package com.ecotrack.dashboard.ai.service;

import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.dashboard.ai.dto.BehavioralInsightsContext;
import com.ecotrack.dashboard.ai.dto.BehavioralInsightsResponse;
import com.ecotrack.dashboard.sustainability.dto.BehaviorMetrics;
import com.ecotrack.dashboard.sustainability.service.SustainabilityMetricsService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class BehavioralInsightService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(BehavioralInsightService.class);

    private final SustainabilityMetricsService metricsService;
    private final EcoTrackAiProperties aiProperties;

    public BehavioralInsightService(SustainabilityMetricsService metricsService, EcoTrackAiProperties aiProperties) {
        this.metricsService = metricsService;
        this.aiProperties = aiProperties;
    }

    public BehavioralInsightsResponse getOrGenerate(Long userId, BehavioralInsightsContext context) {
        try {
            BehaviorMetrics metrics = metricsService.calculateBehavior(userId, LocalDate.now(), 30);
            
            List<BehavioralInsightsResponse.Insight> insights = new ArrayList<>();
            for (String pattern : metrics.concerningPatterns()) {
                insights.add(new BehavioralInsightsResponse.Insight(pattern, metrics.dominantCategory(), "Focus on reducing this category", BehavioralInsightsResponse.Insight.ImpactWeight.HIGH));
            }
            for (String pattern : metrics.positivePatterns()) {
                insights.add(new BehavioralInsightsResponse.Insight(pattern, "General", "Keep up the good work!", BehavioralInsightsResponse.Insight.ImpactWeight.LOW));
            }
            if (insights.isEmpty()) {
                insights.add(new BehavioralInsightsResponse.Insight("No clear patterns detected yet.", "General", "Keep tracking data to unlock insights.", BehavioralInsightsResponse.Insight.ImpactWeight.LOW));
            }
            
            return new BehavioralInsightsResponse(insights);
        } catch (Exception e) {
            log.warn("Deterministic behavioral insight failed for user {}: {}", userId, e.getMessage());
            return fallbackInsight();
        }
    }

    public void scheduledGenerate(Long userId, BehavioralInsightsContext context) {
        // Scheduler generation removed in Phase B to prevent background API limits.
    }

    private BehavioralInsightsResponse fallbackInsight() {
        return new BehavioralInsightsResponse(List.of(
            new BehavioralInsightsResponse.Insight(
                "Consistently log your habits to unlock personalized behavioral insights.",
                "General",
                "Start logging your daily transport, meals, and home energy consumption.",
                BehavioralInsightsResponse.Insight.ImpactWeight.LOW
            )
        ));
    }
}
