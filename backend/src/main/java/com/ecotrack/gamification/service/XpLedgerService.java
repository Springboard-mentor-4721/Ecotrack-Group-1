package com.ecotrack.gamification.service;

import com.ecotrack.event.CarbonEntryCreatedEvent;
import com.ecotrack.event.DailyLoginEvent;
import com.ecotrack.event.GoalCompletedEvent;
import com.ecotrack.event.XPGrantedEvent;
import com.ecotrack.gamification.config.GamificationConfigService;
import com.ecotrack.gamification.entity.XpLedger;
import com.ecotrack.gamification.enums.XpSourceType;
import com.ecotrack.gamification.repository.XpLedgerRepository;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class XpLedgerService {

    private final XpLedgerRepository xpLedgerRepository;
    private final UserRepository userRepository;
    private final GamificationConfigService configService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void awardXp(Long userId, Integer xpAmount, XpSourceType sourceType, Long sourceId, String correlationId) {
        if (xpAmount <= 0) {
            return;
        }

        userRepository.findById(userId).ifPresent(user -> {
            XpLedger ledger = XpLedger.builder()
                    .user(user)
                    .xpAwarded(xpAmount)
                    .sourceType(sourceType)
                    .sourceId(sourceId)
                    .build();

            xpLedgerRepository.save(ledger);
            
            Long totalXp = xpLedgerRepository.findSumByUserId(userId);
            log.info("Awarded {} XP to user {} for {}", xpAmount, userId, sourceType);

            eventPublisher.publishEvent(new XPGrantedEvent(userId, xpAmount, totalXp, correlationId));
        });
    }

    private void awardXpWithCap(Long userId, Integer xpAmount, XpSourceType sourceType, Long sourceId, int dailyCap, String correlationId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        int countToday = xpLedgerRepository.countByUser_IdAndSourceTypeAndAwardedAtAfter(userId, sourceType, startOfDay);

        if (countToday < dailyCap) {
            awardXp(userId, xpAmount, sourceType, sourceId, correlationId);
        } else {
            log.info("Daily cap reached for user {} on {}", userId, sourceType);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCarbonEntryCreated(CarbonEntryCreatedEvent event) {
        int cap = configService.getInt("MAX_DAILY_CARBON_ENTRY_CAP", 3);
        int xp = configService.getInt("CARBON_ENTRY_XP", 25);
        
        awardXpWithCap(event.getUserId(), xp, XpSourceType.CARBON_ENTRY, event.getEntryId(), cap, event.getCorrelationId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleGoalCompleted(GoalCompletedEvent event) {
        if (xpLedgerRepository.existsByUser_IdAndSourceTypeAndSourceId(event.getUserId(), XpSourceType.GOAL_COMPLETED, event.getGoalId())) {
            log.info("Goal {} already awarded XP to user {}", event.getGoalId(), event.getUserId());
            return;
        }
        int xp = configService.getInt("GOAL_COMPLETION_XP", 100);
        
        awardXp(event.getUserId(), xp, XpSourceType.GOAL_COMPLETED, event.getGoalId(), event.getCorrelationId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleDailyLogin(DailyLoginEvent event) {
        int cap = configService.getInt("MAX_DAILY_LOGIN_CAP", 1);
        int xp = configService.getInt("DAILY_LOGIN_XP", 10);
        
        LocalDate today = LocalDate.now();
        Long sourceId = (long) (today.getYear() * 10000 + today.getMonthValue() * 100 + today.getDayOfMonth());
        
        awardXpWithCap(event.getUserId(), xp, XpSourceType.DAILY_LOGIN, sourceId, cap, event.getCorrelationId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleChallengeCompleted(com.ecotrack.event.ChallengeCompletedEvent event) {
        if (xpLedgerRepository.existsByUser_IdAndSourceTypeAndSourceId(event.getUserId(), XpSourceType.CHALLENGE_COMPLETED, event.getChallengeId())) {
            log.info("Challenge {} already awarded XP to user {}", event.getChallengeId(), event.getUserId());
            return;
        }
        awardXp(event.getUserId(), event.getRewardXp(), XpSourceType.CHALLENGE_COMPLETED, event.getChallengeId(), event.getCorrelationId());
    }
}

