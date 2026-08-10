package com.ecotrack.dashboard.ai.dto;

import java.util.List;

public record AiInsightsResponse(
    String summary,
    String trendExplanation,
    List<String> positiveObservations,
    List<String> areasForImprovement,
    List<String> recommendations,
    String generationSource
) {}
