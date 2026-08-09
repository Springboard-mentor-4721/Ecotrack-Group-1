package com.ecotrack.dashboard.ai.dto;

import java.util.List;

public record BehavioralInsightsResponse(List<Insight> insights) {
    public record Insight(
            String patternText,
            String category,
            String recommendation,
            ImpactWeight impactWeight
    ) {
        public enum ImpactWeight { LOW, MEDIUM, HIGH }
    }
}
