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
            int currentStreak = profile.getCurrentStreak() == null ? 0 : profile.getCurrentStreak();
            currentStreak++;
            profile.setCurrentStreak(currentStreak);
            profileRepository.save(profile);
            
            checkMilestones(event.getUserId(), currentStreak);
        });
    }
    
    private void checkMilestones(Long userId, int currentStreak) {
        if (currentStreak == 7) {
            int xp = configService.getInt("STREAK_7_DAY_XP", 200);
            xpLedgerService.awardXp(userId, xp, XpSourceType.STREAK_BONUS, null);
            eventPublisher.publishEvent(new StreakMilestoneEvent(userId, 7));
        } else if (currentStreak == 30) {
            xpLedgerService.awardXp(userId, 500, XpSourceType.STREAK_BONUS, null);
            eventPublisher.publishEvent(new StreakMilestoneEvent(userId, 30));
        } else if (currentStreak == 100) {
            xpLedgerService.awardXp(userId, 2000, XpSourceType.STREAK_BONUS, null);
            eventPublisher.publishEvent(new StreakMilestoneEvent(userId, 100));
        }
    }
}
