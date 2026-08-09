package com.ecotrack.tracking.ai.dto;

import java.util.List;

public record JournalSummaryResponse(
        String summaryText,
        String highestEmissionCategory,
        String mostImprovedCategory,     // nullable
        OverallProgress overallProgress,
        List<String> recommendations
) {
    public enum OverallProgress { IMPROVING, WORSENING, STABLE, INSUFFICIENT_DATA }
}
