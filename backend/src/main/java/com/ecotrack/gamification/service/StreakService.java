package com.ecotrack.gamification.service;

import com.ecotrack.event.DailyLoginEvent;
import com.ecotrack.event.StreakMilestoneEvent;
import com.ecotrack.gamification.config.GamificationConfigService;
import com.ecotrack.gamification.enums.XpSourceType;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Service
@RequiredArgsConstructor
public class StreakService {

    private final UserGamificationProfileRepository profileRepository;
    private final GamificationConfigService configService;
    private final XpLedgerService xpLedgerService;
    private final ApplicationEventPublisher eventPublisher;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleDailyLogin(DailyLoginEvent event) {
        profileRepository.findByUserId(event.getUserId()).ifPresent(profile -> {
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate lastActivity = profile.getLastActivityDate();
            
            if (lastActivity != null && lastActivity.isEqual(today)) {
                return; // Already processed streak for today
            }
            
            int currentStreak = profile.getCurrentStreak() == null ? 0 : profile.getCurrentStreak();
            
            if (lastActivity != null && lastActivity.isEqual(today.minusDays(1))) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
            
            profile.setCurrentStreak(currentStreak);
            profile.setLastActivityDate(today);
            
            int longestStreak = profile.getLongestStreak() == null ? 0 : profile.getLongestStreak();
            if (currentStreak > longestStreak) {
                profile.setLongestStreak(currentStreak);
            }
            
            profileRepository.save(profile);
            
            checkMilestones(event.getUserId(), currentStreak, event.getCorrelationId());
        });
    }
    
    private void checkMilestones(Long userId, int currentStreak, String correlationId) {
        java.time.LocalDate today = java.time.LocalDate.now();
        Long sourceId = (long) (today.getYear() * 10000 + today.getMonthValue() * 100 + today.getDayOfMonth());

        if (currentStreak == 7) {
            int xp = configService.getInt("STREAK_7_DAY_XP", 200);
            xpLedgerService.awardXp(userId, xp, XpSourceType.STREAK_BONUS, sourceId, correlationId);
            eventPublisher.publishEvent(new StreakMilestoneEvent(userId, 7, correlationId));
        } else if (currentStreak == 30) {
            int xp = configService.getInt("STREAK_30_DAY_XP", 500);
            xpLedgerService.awardXp(userId, xp, XpSourceType.STREAK_BONUS, sourceId, correlationId);
            eventPublisher.publishEvent(new StreakMilestoneEvent(userId, 30, correlationId));
        } else if (currentStreak == 100) {
            int xp = configService.getInt("STREAK_100_DAY_XP", 2000);
            xpLedgerService.awardXp(userId, xp, XpSourceType.STREAK_BONUS, sourceId, correlationId);
            eventPublisher.publishEvent(new StreakMilestoneEvent(userId, 100, correlationId));
        }
    }
}
