package com.ecotrack.dashboard.sustainability.dto;

import java.util.List;

public record BehaviorMetrics(
        List<String> positivePatterns,
        List<String> concerningPatterns,
        String dominantCategory,
        List<String> improvementAreas
) {}
