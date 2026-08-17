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
public class AdminBadgeAnalyticsDTO {
    private long totalBadgesAwarded;
    private long badgesAwardedInPeriod;
    
    private List<AnalyticsDistributionDTO> mostAwardedBadges;
    private List<AnalyticsDistributionDTO> badgeTypeDistribution;
}
