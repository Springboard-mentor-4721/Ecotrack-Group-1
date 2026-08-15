package com.ecotrack.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverviewReportDTO {
    private String startDate;
    private String endDate;

    // Environmental Impact
    private BigDecimal totalEmissions;
    private int activeGoals;
    private int completedGoals;
    private int completedChallenges;
    
    // XP Activity Summary
    private long periodXpEarned;
    
    // Gamification Snapshot
    private int currentEcoScore;
    private int currentLevel;
}
