package com.ecotrack.admin.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminGamificationAnalyticsDTO {
    private long totalPlatformXp;
    private long xpAwardedInPeriod;
    private double averageEcoScore;
    
    private List<AnalyticsDistributionDTO> xpSourceDistribution;
    private List<AnalyticsDistributionDTO> levelDistribution;
    private List<AnalyticsTrendPointDTO> xpEarnedTrend;
}
