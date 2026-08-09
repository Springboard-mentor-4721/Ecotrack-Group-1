package com.ecotrack.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ecotrack.ai")
public record EcoTrackAiProperties(
        boolean enabled,
        Models models,
        Timeouts timeouts,
        Cache cache,
        RateLimit rateLimit
) {
    public record Models(String smartSuggestion, String dailyTip, String trendPrediction,
                          String journalSummary, String behavioralInsight) {}
    public record Timeouts(int callSeconds, int retryMaxAttempts) {}
    public record Cache(int dailyTipTtlHours, int trendPredictionTtlHours,
                         int journalSummaryWeeklyTtlDays, int journalSummaryMonthlyTtlDays,
                         int behavioralInsightTtlDays) {}
    public record RateLimit(int requestsPerUserPerMinute) {}
}
