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
public class AdminUserAnalyticsDTO {
    private long totalUsers;
    private long activeUsers;
    private long suspendedUsers;
    private long adminUsers;
    private long newUsersInPeriod;
    
    private List<AnalyticsDistributionDTO> statusDistribution;
    private List<AnalyticsDistributionDTO> roleDistribution;
    private List<AnalyticsTrendPointDTO> registrationTrend;
}
