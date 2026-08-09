package com.ecotrack.dashboard.ai.dto;

import java.time.LocalDate;
import java.util.List;

public record TrendPredictionResponse(
        List<ForecastPoint> forecast,
        TrendDirection trendDirection,
        Confidence confidence,
        String explanation,
        String recommendation
) {
    public record ForecastPoint(LocalDate date, double predictedCo2eKg) {}
    public enum TrendDirection { IMPROVING, WORSENING, STABLE }
    public enum Confidence { LOW, MEDIUM, HIGH }
}
