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
public class AdminChallengeAnalyticsDTO {
    private long totalChallenges;
    private long activeChallenges;
    private long completedChallenges;
    private long pendingChallenges;
    private long upcomingChallenges;
    
    private long totalParticipants;
    private long xpDistributedInPeriod;
    
    private List<AnalyticsDistributionDTO> categoryDistribution;
    private List<AnalyticsDistributionDTO> statusDistribution;
}
