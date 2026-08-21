package com.ecotrack.dashboard.service;

import com.ecotrack.dashboard.dto.*;
import com.ecotrack.gamification.dto.GamificationProfileDTO;
import com.ecotrack.gamification.dto.BadgeDTO;
import com.ecotrack.leaderboard.LeaderboardEntryDTO;
import com.ecotrack.challenge.dto.ChallengeParticipantDTO;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import com.ecotrack.gamification.engine.EcoScoreEngine;
import com.ecotrack.gamification.config.GamificationConfigService;
import com.ecotrack.leaderboard.LeaderboardService;
import com.ecotrack.goal.service.GoalService;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import com.ecotrack.gamification.repository.UserBadgeRepository;
import com.ecotrack.tracking.repository.CarbonEntryRepository;
import com.ecotrack.goal.entity.enums.GoalStatus;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import com.ecotrack.tracking.repository.projection.CategoryEmissionProjection;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardSummaryServiceImpl implements DashboardSummaryService {

    private final UserRepository userRepository;
    private final DashboardService dashboardService;
    private final CarbonEntryRepository carbonEntryRepository;
    private final GoalService goalService;
    private final UserGamificationProfileRepository gamificationProfileRepository;
    private final EcoScoreEngine ecoScoreEngine;
    private final GamificationConfigService configService;
    private final LeaderboardService leaderboardService;
    private final ChallengeParticipantRepository challengeParticipantRepository;
    private final UserBadgeRepository userBadgeRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardSummary(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Long userId = user.getId();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneMonthAgo = now.minusMonths(1);
        LocalDateTime twoMonthsAgo = now.minusMonths(2);
        LocalDateTime oneWeekAgo = now.minusWeeks(1);

        // 1. Get base data from existing DashboardService to reuse calculations for trends and basic summary
        DashboardResponse baseResponse = dashboardService.getDashboardData(userEmail);

        // 2. Augment User Summary
        UserSummaryDTO userSummary = baseResponse.getUserSummary();
        BigDecimal previousMonthEmission = sumEmissions(userId, twoMonthsAgo, oneMonthAgo);
        long weeklyEntries = carbonEntryRepository.countByUserIdAndEntryDateBetween(userId, oneWeekAgo, now);
        userSummary.setPreviousMonthEmission(previousMonthEmission);
        userSummary.setWeeklyEntries(weeklyEntries);

        // 3. Augment Goal Summary
        GoalSummaryDTO goalSummary = baseResponse.getGoalSummary();
        List<com.ecotrack.goal.dto.GoalResponse> topGoals = goalService.getUserGoalsByStatus(
                userId, GoalStatus.ACTIVE, PageRequest.of(0, 3, Sort.by(Sort.Direction.ASC, "targetDate"))).getContent();
        goalSummary.setActiveGoalsList(topGoals);

        // 4. Gamification Profile
        GamificationProfileDTO gamificationProfile = gamificationProfileRepository.findByUserId(userId)
                .map(p -> {
                    long currentXp = p.getLifetimeEcoXp();
                    int nextLevel = p.getCurrentLevel() + 1;
                    String configKey = "LEVEL_" + nextLevel + "_THRESHOLD";
                    long nextLevelXpThreshold = 0;
                    long currentLevelBaseXp = 0;
                    try {
                        nextLevelXpThreshold = configService.getInt(configKey, p.getCurrentLevel() * 1000);
                        currentLevelBaseXp = configService.getInt("LEVEL_" + p.getCurrentLevel() + "_THRESHOLD", (p.getCurrentLevel() - 1) * 1000);
                    } catch (Exception e) {
                        nextLevelXpThreshold = p.getCurrentLevel() * 1000L;
                        currentLevelBaseXp = (p.getCurrentLevel() - 1) * 1000L;
                    }
                    
                    int effectiveStreak = p.getCurrentStreak() == null ? 0 : p.getCurrentStreak();
                    java.time.LocalDate today = java.time.LocalDate.now();
                    if (p.getLastActivityDate() != null && p.getLastActivityDate().isBefore(today.minusDays(1))) {
                        effectiveStreak = 0;
                    }

                    return GamificationProfileDTO.builder()
                        .userId(userId)
                        .currentEcoScore(p.getCurrentEcoScore() != null ? p.getCurrentEcoScore() : BigDecimal.ZERO)
                        .currentEcoGrade(ecoScoreEngine.calculateGrade(p.getCurrentEcoScore()))
                        .lifetimeEcoXp(p.getLifetimeEcoXp())
                        .currentLevel(p.getCurrentLevel())
                        .currentLevelBaseXp(currentLevelBaseXp)
                        .nextLevelXp(nextLevelXpThreshold)
                        .currentStreak(effectiveStreak)
                        .longestStreak(p.getLongestStreak())
                        .build();
                })
                .orElse(GamificationProfileDTO.builder()
                        .currentEcoScore(BigDecimal.ZERO)
                        .currentEcoGrade("N/A")
                        .build());

        // 5. Leaderboard Rank
        LeaderboardEntryDTO leaderboardRank = leaderboardService.getMyRank(userId, com.ecotrack.leaderboard.enums.LeaderboardType.XP, com.ecotrack.leaderboard.enums.LeaderboardPeriod.ALL_TIME);
        LeaderboardEntryDTO monthlyLeaderboardRank = leaderboardService.getMyMonthlyRank(userId);

        // 6. Active Challenges
        List<ChallengeParticipantDTO> activeChallenges = challengeParticipantRepository.findByUserIdAndStatusIn(
                userId, List.of(ChallengeParticipantStatus.ACTIVE, ChallengeParticipantStatus.WITHIN_BUDGET))
                .stream()
                .limit(3)
                .map(cp -> ChallengeParticipantDTO.builder()
                        .id(cp.getId())
                        .challengeId(cp.getChallenge().getId())
                        .userId(cp.getUserId())
                        .progress(cp.getProgress())
                        .status(cp.getStatus())
                        .joinedAt(cp.getJoinedAt())
                        .challengeTitle(cp.getChallenge().getTitle())
                        .targetValue(cp.getChallenge().getTargetValue())
                        .progressMetric(cp.getChallenge().getProgressMetric())
                        .build())
                .collect(Collectors.toList());

        // 7. Recent Badges
        List<BadgeDTO> recentBadges = userBadgeRepository.findByUserId(userId)
                .stream()
                .sorted((a, b) -> b.getAwardedAt().compareTo(a.getAwardedAt()))
                .limit(3)
                .map(ub -> BadgeDTO.builder()
                        .id(ub.getBadge().getId())
                        .name(ub.getBadge().getName())
                        .category(ub.getBadge().getCategory())
                        .description(ub.getBadge().getDescription())
                        .rarity(ub.getBadge().getRarity())
                        .awardedAt(ub.getAwardedAt())
                        .isEarned(true)
                        .icon(ub.getBadge().getIcon())
                        .type(ub.getBadge().getType())
                        .color(ub.getBadge().getColor())
                        .build())
                .collect(Collectors.toList());

        return DashboardSummaryDTO.builder()
                .userSummary(userSummary)
                .goalSummary(goalSummary)
                .gamificationProfile(gamificationProfile)
                .leaderboardRank(leaderboardRank)
                .monthlyLeaderboardRank(monthlyLeaderboardRank)
                .activeChallenges(activeChallenges)
                .monthlyTrend(baseResponse.getMonthlyTrend())
                .categoryBreakdown(baseResponse.getCategoryBreakdown())
                .recentActivities(baseResponse.getRecentActivities())
                .recentBadges(recentBadges)
                .build();
    }

    private BigDecimal sumEmissions(Long userId, LocalDateTime start, LocalDateTime end) {
        return carbonEntryRepository.getEmissionSummaryByUserAndDateRange(userId, start, end)
                .stream()
                .map(CategoryEmissionProjection::getTotalEmission)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
