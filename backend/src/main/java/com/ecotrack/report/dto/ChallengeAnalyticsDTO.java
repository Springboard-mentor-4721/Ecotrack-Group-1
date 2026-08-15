package com.ecotrack.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeAnalyticsDTO {
    private String startDate;
    private String endDate;

    // Summary KPIs
    private long totalParticipated;
    private long completedChallenges;
    private BigDecimal completionRate; // Percentage
    private long totalXpEarned;
    
    // Period Comparison
    private long previousPeriodCompleted;
    private BigDecimal completionChangePercentage;
    private String completionDirection; // IMPROVED, DECREASED, NO_PREVIOUS_DATA, NO_CHANGE

    private long previousPeriodXp;
    private BigDecimal xpChangePercentage;
    private String xpDirection;

    // Status Distribution
    private Map<String, Long> statusDistribution;

    // Trend
    private List<ChallengeTrendDTO> completionTrend;

    // Insights
    private List<String> insights;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChallengeTrendDTO {
        private String date;
        private long count;
    }
}
