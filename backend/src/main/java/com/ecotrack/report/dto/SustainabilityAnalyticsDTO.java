package com.ecotrack.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SustainabilityAnalyticsDTO {
    private String startDate;
    private String endDate;

    // Environmental
    private BigDecimal totalEmissions;
    private BigDecimal previousPeriodEmissions;
    private BigDecimal emissionChangePercentage;
    private String emissionDirection;

    // Goals
    private long completedGoals;
    private long activeGoals;
    private long previousCompletedGoals;

    // Challenges
    private long completedChallenges;
    private long participatedChallenges;
    private long previousCompletedChallenges;

    // XP
    private long periodXpEarned;
    private long previousPeriodXpEarned;

    // Gamification (Current State)
    private int currentEcoScore;
    private int currentLevel;
    private int currentStreak;

    // Insights & Actions
    private List<String> insights;
    private String recommendedFocus;
}
