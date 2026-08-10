package com.ecotrack.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ecotrack.ai")
public record EcoTrackAiProperties(
        boolean enabled,
        Features features,
        Models models,
        Timeouts timeouts,
        Cache cache,
        RateLimit rateLimit,
        ManualRateLimit manualRateLimit
) {
    public record Features(
        boolean insightsEnabled,
        boolean journalSummaryEnabled,
        boolean dailyTipEnabled
    ) {}

    public record Models(String smartSuggestion, String dailyTip, String trendPrediction,
                          String journalSummary, String behavioralInsight, String unifiedInsights) {}
    public record Timeouts(int callSeconds, int retryMaxAttempts) {}
    public record Cache(int dailyTipTtlHours, int trendPredictionTtlHours,
                         int journalSummaryWeeklyTtlDays, int journalSummaryMonthlyTtlDays,
                         int behavioralInsightTtlDays, int unifiedInsightsTtlHours) {}
    public record RateLimit(int requestsPerUserPerMinute) {}
    public record ManualRateLimit(boolean enabled, int requestsPerMinute) {}
}
