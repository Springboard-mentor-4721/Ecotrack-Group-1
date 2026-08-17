package com.ecotrack.admin.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewAnalyticsDTO {
    private long totalUsers;
    private long activeUsers;
    private long suspendedUsers;
    private long totalXp;
    private double averageEcoScore;
    private long totalBadgesAwarded;
    private long totalChallenges;
    private long activeChallenges;
    private long completedChallenges;
    private long totalChallengeXp;
    private double totalCarbonImpact;
}
