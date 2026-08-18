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

    private CarbonReportDTO carbonReport;
    private GoalReportDTO goalReport;
    private ChallengeReportDTO challengeReport;
    
    // Gamification
    private String userName;
    private String userEmail;
    private int currentEcoScore;
    private String currentRank;

    // XP Activity
    private java.util.List<XpTransactionDTO> xpTransactions;
}
