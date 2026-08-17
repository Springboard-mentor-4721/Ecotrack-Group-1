package com.ecotrack.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardPulseDTO {
    private long totalUsers;
    private long activeChallengesCount;
    private long upcomingChallengesCount;
    private long completedChallengesCount;
}
