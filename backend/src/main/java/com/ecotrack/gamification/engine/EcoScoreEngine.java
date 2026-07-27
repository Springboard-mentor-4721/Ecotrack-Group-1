package com.ecotrack.gamification.engine;

import com.ecotrack.gamification.config.GamificationConfigService;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class EcoScoreEngine {

    private final UserGamificationProfileRepository profileRepository;
    private final GamificationConfigService configService;

    @Transactional
    public void recalculateScore(Long userId) {
        profileRepository.findByUserId(userId).ifPresent(profile -> {
            
            // Simplified Eco Score Calculation for Milestone 3
            // Base Score = min((Streak * 1) + (XP / 100), 100)
            
            long xp = profile.getLifetimeEcoXp() == null ? 0 : profile.getLifetimeEcoXp();
            int streak = profile.getCurrentStreak() == null ? 0 : profile.getCurrentStreak();
            
            BigDecimal scoreFromXp = BigDecimal.valueOf(xp).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal scoreFromStreak = BigDecimal.valueOf(streak);
            
            BigDecimal totalScore = scoreFromXp.add(scoreFromStreak);
            
            if (totalScore.compareTo(BigDecimal.valueOf(100)) > 0) {
                totalScore = BigDecimal.valueOf(100);
            }
            
            profile.setCurrentEcoScore(totalScore);
            profile.setLastActivityDate(LocalDate.now());
            
            profileRepository.save(profile);
            log.info("Recalculated Eco Score for user {}: {}", userId, totalScore);
        });
    }
    
    @TransactionalEventListener(phase = org.springframework.transaction.event.TransactionPhase.AFTER_COMMIT)
    public void handleXPGranted(com.ecotrack.event.XPGrantedEvent event) {
        recalculateScore(event.getUserId());
    }

    @Scheduled(cron = "0 2 * * * *") // Run daily at 2:00 AM
    @Transactional
    public void scheduledDecayJob() {
        int inactiveDaysThreshold = configService.getInt("ECO_SCORE_INACTIVE_DAYS", 7);
        BigDecimal decayRate = configService.getDecimal("ECO_SCORE_DECAY_RATE", new BigDecimal("0.5"));
        
        LocalDate thresholdDate = LocalDate.now().minusDays(inactiveDaysThreshold);
        
        profileRepository.findAll().forEach(profile -> {
            if (profile.getLastActivityDate() != null && profile.getLastActivityDate().isBefore(thresholdDate)) {
                long daysInactive = ChronoUnit.DAYS.between(profile.getLastActivityDate(), LocalDate.now());
                long daysToDecay = daysInactive - inactiveDaysThreshold;
                
                if (daysToDecay > 0) {
                    BigDecimal decayAmount = decayRate.multiply(BigDecimal.valueOf(daysToDecay));
                    BigDecimal newScore = profile.getCurrentEcoScore().subtract(decayAmount);
                    
                    if (newScore.compareTo(BigDecimal.ZERO) < 0) {
                        newScore = BigDecimal.ZERO;
                    }
                    
                    profile.setCurrentEcoScore(newScore);
                    profileRepository.save(profile);
                    log.info("Applied Eco Score decay for user {}: new score {}", profile.getUserId(), newScore);
                }
            }
        });
    }
}
