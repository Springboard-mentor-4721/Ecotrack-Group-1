package com.ecotrack.tracking.ai.dto;

public record SmartSuggestionResponse(
        String suggestionText,
        ImpactLevel impactLevel,
        String category
) {
    public enum ImpactLevel { LOW, MEDIUM, HIGH }
}
