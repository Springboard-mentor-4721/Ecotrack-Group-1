package com.ecotrack.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private UserSummaryDTO userSummary;
    private GoalSummaryDTO goalSummary;
    private List<CarbonTrendDTO> monthlyTrend;
    private List<CategoryBreakdownDTO> categoryBreakdown;
    private List<RecentActivityDTO> recentActivities;
    private EcoScoreDTO ecoScore;
}
