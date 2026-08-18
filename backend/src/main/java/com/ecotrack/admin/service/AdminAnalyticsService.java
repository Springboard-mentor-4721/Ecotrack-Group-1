package com.ecotrack.admin.service;

import com.ecotrack.admin.dto.analytics.*;
import com.ecotrack.challenge.repository.ChallengeRepository;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import com.ecotrack.gamification.repository.UserBadgeRepository;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import com.ecotrack.gamification.repository.XpLedgerRepository;
import com.ecotrack.tracking.repository.CarbonEntryRepository;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.common.enums.Role;
import com.ecotrack.common.enums.Status;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final UserGamificationProfileRepository gamificationProfileRepository;
    private final XpLedgerRepository xpLedgerRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipantRepository challengeParticipantRepository;
    private final CarbonEntryRepository carbonEntryRepository;

    private LocalDateTime getEpoch() {
        return LocalDateTime.of(2000, 1, 1, 0, 0);
    }

    public AdminOverviewAnalyticsDTO getOverview() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(Status.ACTIVE);
        long suspendedUsers = userRepository.countByStatus(Status.SUSPENDED);
        
        long totalXp = xpLedgerRepository.getTotalPlatformXp();
        Double avgEcoScore = gamificationProfileRepository.getAverageEcoScore();
        
        long totalBadges = userBadgeRepository.count();
        long totalChallenges = challengeRepository.count();
        
        long activeChallenges = challengeRepository.countByStatus(com.ecotrack.challenge.enums.ChallengeStatus.ACTIVE);
        long completedChallenges = challengeRepository.countByStatus(com.ecotrack.challenge.enums.ChallengeStatus.COMPLETED);
        long totalChallengeXp = xpLedgerRepository.getPlatformXpInPeriodBySource(
                com.ecotrack.gamification.enums.XpSourceType.CHALLENGE_COMPLETED, 
                getEpoch(), 
                LocalDateTime.now()
        );
        
        Double totalCarbon = carbonEntryRepository.getTotalPlatformCarbonImpact();

        return AdminOverviewAnalyticsDTO.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .suspendedUsers(suspendedUsers)
                .totalXp(totalXp)
                .averageEcoScore(avgEcoScore != null ? avgEcoScore : 0.0)
                .totalBadgesAwarded(totalBadges)
                .totalChallenges(totalChallenges)
                .activeChallenges(activeChallenges)
                .completedChallenges(completedChallenges)
                .totalChallengeXp(totalChallengeXp)
                .totalCarbonImpact(totalCarbon != null ? totalCarbon : 0.0)
                .build();
    }

    public AdminUserAnalyticsDTO getUserAnalytics(AdminAnalyticsFilter filter) {
        LocalDateTime start = filter.getStartDate() != null ? filter.getStartDate() : getEpoch();
        LocalDateTime end = filter.getEndDate() != null ? filter.getEndDate() : LocalDateTime.now();
        
        return AdminUserAnalyticsDTO.builder()
                .totalUsers(userRepository.count())
                .activeUsers(userRepository.countByStatus(Status.ACTIVE))
                .suspendedUsers(userRepository.countByStatus(Status.SUSPENDED))
                .adminUsers(userRepository.countByRole(Role.ADMIN))
                .newUsersInPeriod(userRepository.countNewUsersInPeriod(start, end))
                .statusDistribution(userRepository.getUserStatusDistribution())
                .roleDistribution(userRepository.getUserRoleDistribution())
                .registrationTrend(userRepository.getRegistrationTrend(start, end))
                .build();
    }

    public AdminGamificationAnalyticsDTO getGamificationAnalytics(AdminAnalyticsFilter filter) {
        LocalDateTime start = filter.getStartDate() != null ? filter.getStartDate() : getEpoch();
        LocalDateTime end = filter.getEndDate() != null ? filter.getEndDate() : LocalDateTime.now();
        
        Double avgEcoScore = gamificationProfileRepository.getAverageEcoScore();
        
        return AdminGamificationAnalyticsDTO.builder()
                .totalPlatformXp(xpLedgerRepository.getTotalPlatformXp())
                .xpAwardedInPeriod(xpLedgerRepository.getPlatformXpInPeriod(start, end))
                .averageEcoScore(avgEcoScore != null ? avgEcoScore : 0.0)
                .xpSourceDistribution(xpLedgerRepository.getXpDistributionBySource(start, end))
                .levelDistribution(gamificationProfileRepository.getLevelDistribution())
                .xpEarnedTrend(xpLedgerRepository.getPlatformXpTrend(start, end))
                .build();
    }

    public AdminBadgeAnalyticsDTO getBadgeAnalytics(AdminAnalyticsFilter filter) {
        LocalDateTime start = filter.getStartDate() != null ? filter.getStartDate() : getEpoch();
        LocalDateTime end = filter.getEndDate() != null ? filter.getEndDate() : LocalDateTime.now();
        
        return AdminBadgeAnalyticsDTO.builder()
                .totalBadgesAwarded(userBadgeRepository.count())
                .badgesAwardedInPeriod(userBadgeRepository.countAwardedInPeriod(start, end))
                .mostAwardedBadges(userBadgeRepository.getBadgeAwardDistribution())
                .badgeTypeDistribution(userBadgeRepository.getBadgeTypeDistribution())
                .build();
    }

    public AdminChallengeAnalyticsDTO getChallengeAnalytics(AdminAnalyticsFilter filter) {
        LocalDateTime start = filter.getStartDate() != null ? filter.getStartDate() : getEpoch();
        LocalDateTime end = filter.getEndDate() != null ? filter.getEndDate() : LocalDateTime.now();
        
        return AdminChallengeAnalyticsDTO.builder()
                .totalChallenges(challengeRepository.countByCreatedAtBetween(start, end))
                .activeChallenges(challengeRepository.countByStatus(com.ecotrack.challenge.enums.ChallengeStatus.ACTIVE))
                .completedChallenges(challengeRepository.countByStatus(com.ecotrack.challenge.enums.ChallengeStatus.COMPLETED))
                .pendingChallenges(challengeRepository.countByStatus(com.ecotrack.challenge.enums.ChallengeStatus.PENDING))
                .upcomingChallenges(challengeRepository.countByStatus(com.ecotrack.challenge.enums.ChallengeStatus.UPCOMING))
                .totalParticipants(challengeParticipantRepository.countParticipantsInPeriod(start, end))
                .xpDistributedInPeriod(xpLedgerRepository.getPlatformXpInPeriodBySource(com.ecotrack.gamification.enums.XpSourceType.CHALLENGE_COMPLETED, start, end))
                .metricDistribution(challengeRepository.getMetricDistribution(start, end))
                .statusDistribution(challengeRepository.getStatusDistribution(start, end))
                .build();
    }

    public AdminSustainabilityAnalyticsDTO getSustainabilityAnalytics(AdminAnalyticsFilter filter) {
        LocalDateTime start = filter.getStartDate() != null ? filter.getStartDate() : getEpoch();
        LocalDateTime end = filter.getEndDate() != null ? filter.getEndDate() : LocalDateTime.now();
        
        Double totalImpact = carbonEntryRepository.getTotalPlatformCarbonImpact();
        Double periodImpact = carbonEntryRepository.getPeriodPlatformCarbonImpact(start, end);
        
        return AdminSustainabilityAnalyticsDTO.builder()
                .totalCarbonImpact(totalImpact != null ? totalImpact : 0.0)
                .carbonImpactInPeriod(periodImpact != null ? periodImpact : 0.0)
                .impactByCategory(carbonEntryRepository.getImpactByCategory(start, end))
                .carbonTrend(carbonEntryRepository.getPeriodCarbonTrend(start, end))
                .build();
    }
}
