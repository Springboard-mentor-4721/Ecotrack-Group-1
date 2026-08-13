package com.ecotrack.dashboard.dto;

import com.ecotrack.gamification.dto.GamificationProfileDTO;
import com.ecotrack.gamification.dto.BadgeDTO;
import com.ecotrack.leaderboard.LeaderboardEntryDTO;
import com.ecotrack.challenge.dto.ChallengeParticipantDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private UserSummaryDTO userSummary;
    private GoalSummaryDTO goalSummary;
    private GamificationProfileDTO gamificationProfile;
    private LeaderboardEntryDTO leaderboardRank;
    private LeaderboardEntryDTO monthlyLeaderboardRank;
    private List<ChallengeParticipantDTO> activeChallenges;
    private List<CarbonTrendDTO> monthlyTrend;
    private List<CategoryBreakdownDTO> categoryBreakdown;
    private List<RecentActivityDTO> recentActivities;
    private List<BadgeDTO> recentBadges;
}
