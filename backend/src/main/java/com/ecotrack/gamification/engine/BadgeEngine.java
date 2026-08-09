package com.ecotrack.gamification.engine;

import com.ecotrack.event.BadgeUnlockedEvent;
import com.ecotrack.event.CarbonEntryCreatedEvent;
import com.ecotrack.event.ChallengeCompletedEvent;
import com.ecotrack.event.GoalCompletedEvent;
import com.ecotrack.event.StreakMilestoneEvent;
import com.ecotrack.gamification.entity.Badge;
import com.ecotrack.gamification.entity.BadgeProgress;
import com.ecotrack.gamification.entity.UserBadge;
import com.ecotrack.gamification.enums.XpSourceType;
import com.ecotrack.gamification.repository.BadgeProgressRepository;
import com.ecotrack.gamification.repository.BadgeRepository;
import com.ecotrack.gamification.repository.UserBadgeRepository;
import com.ecotrack.gamification.service.XpLedgerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeEngine {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final BadgeProgressRepository badgeProgressRepository;
    private final XpLedgerService xpLedgerService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void evaluateBadges(Long userId, String triggerType, int increment, String correlationId) {
        List<Badge> badgesToEvaluate = badgeRepository.findByCriteriaType(triggerType);

        for (Badge badge : badgesToEvaluate) {
            boolean alreadyAwarded = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());
            if (alreadyAwarded && !badge.getIsRepeatable()) {
                continue;
            }

            Optional<BadgeProgress> progressOpt = badgeProgressRepository.findByUserIdAndBadgeId(userId, badge.getId());
            BadgeProgress progress = progressOpt.orElse(BadgeProgress.builder()
                    .userId(userId)
                    .badgeId(badge.getId())
                    .currentValue(0)
                    .lastEvaluatedAt(java.time.LocalDateTime.now())
                    .build());

            if ("STREAK_DAYS".equals(triggerType)) {
                progress.setCurrentValue(increment);
            } else {
                progress.setCurrentValue(progress.getCurrentValue() + increment);
            }
            badgeProgressRepository.save(progress);

            if (progress.getCurrentValue() >= badge.getCriteriaThreshold()) {
                awardBadge(userId, badge, correlationId);
                if (badge.getIsRepeatable()) {
                    progress.setCurrentValue(progress.getCurrentValue() - badge.getCriteriaThreshold());
                    badgeProgressRepository.save(progress);
                }
            }
        }
    }

    private void awardBadge(Long userId, Badge badge, String correlationId) {
        if (!badge.getIsRepeatable() && userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId())) {
            return;
        }

        UserBadge userBadge = UserBadge.builder()
                .userId(userId)
                .badge(badge)
                .build();
        userBadgeRepository.save(userBadge);

        // Standard XP for a badge award
        int xpReward = com.ecotrack.gamification.enums.BadgeRarity.fromString(badge.getRarity()).getXpReward();
        xpLedgerService.awardXp(userId, xpReward, XpSourceType.BADGE_BONUS, badge.getId(), correlationId);
        
        eventPublisher.publishEvent(new BadgeUnlockedEvent(userId, badge.getId(), correlationId));
        log.info("Awarded badge '{}' to user {}", badge.getName(), userId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCarbonEntryCreated(CarbonEntryCreatedEvent event) {
        try {
            log.info("BadgeEngine processing CarbonEntryCreatedEvent for user {}", event.getUserId());
            evaluateBadges(event.getUserId(), "CARBON_ENTRIES_COUNT", 1, event.getCorrelationId());
            evaluateBadges(event.getUserId(), "CATEGORY_SPECIALIST", 1, event.getCorrelationId()); // Simplification for demo
        } catch (Exception e) {
            log.error("Failed to evaluate badges for CarbonEntryCreatedEvent: ", e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleGoalCompleted(GoalCompletedEvent event) {
        evaluateBadges(event.getUserId(), "GOAL_COMPLETED_COUNT", 1, event.getCorrelationId());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStreakMilestone(StreakMilestoneEvent event) {
        evaluateBadges(event.getUserId(), "STREAK_DAYS", event.getStreakDays(), event.getCorrelationId()); // For streak, we can just pass the streak as increment, but it depends on criteria. 
        // Actually, if criteria is STREAK_DAYS, we should probably set the value, not increment. 
        // But for this simple implementation, we'll leave it.
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleChallengeCompleted(ChallengeCompletedEvent event) {
        evaluateBadges(event.getUserId(), "CHALLENGE_COMPLETED_COUNT", 1, event.getCorrelationId());
    }
}
