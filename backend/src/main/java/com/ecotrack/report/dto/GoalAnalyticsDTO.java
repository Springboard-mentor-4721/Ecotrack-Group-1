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
public class GoalAnalyticsDTO {
    private String startDate;
    private String endDate;

    // Summary KPIs
    private long totalGoals;
    private long activeGoals;
    private long completedGoals;
    private BigDecimal completionRate; // Percentage

    // Period progress
    private BigDecimal totalProgressMade;
    
    // Period Comparison
    private BigDecimal previousPeriodProgress;
    private BigDecimal progressChangePercentage;
    private String progressDirection; // IMPROVED, DECREASED, NO_PREVIOUS_DATA, NO_CHANGE

    // Status Distribution
    private Map<String, Long> statusDistribution;

    // Trend
    private List<GoalProgressTrendDTO> progressTrend;

    // Needs Attention
    private List<GoalAttentionDTO> needsAttention;

    // Insights
    private List<String> insights;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoalProgressTrendDTO {
        private String date;
        private BigDecimal progressValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoalAttentionDTO {
        private Long goalId;
        private String goalName;
        private String reason; // e.g., "Deadline approaching", "Expired with incomplete target", "No progress recorded"
    }
}
