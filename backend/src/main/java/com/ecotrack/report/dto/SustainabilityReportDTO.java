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
public class SustainabilityReportDTO {
    private String startDate;
    private String endDate;
    
    // Carbon
    private BigDecimal totalEmissions;
    
    // Goals
    private int totalGoals;
    private int completedGoals;
    
    // Challenges
    private int completedChallenges;
    private long xpEarned;
    
    // Current state gamification
    private int currentEcoScore;
    private String currentRank;
}
