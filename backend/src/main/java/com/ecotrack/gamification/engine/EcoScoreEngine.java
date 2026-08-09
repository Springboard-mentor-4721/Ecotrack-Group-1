package com.ecotrack.gamification.engine;

import com.ecotrack.gamification.config.GamificationConfigService;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
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
    private final jakarta.persistence.EntityManager entityManager;
    private final com.ecotrack.gamification.repository.XpLedgerRepository xpLedgerRepo;

    @Transactional
    public void recalculateScore(Long userId) {
        profileRepository.findByUserId(userId).ifPresent(profile -> {
            
            // 4-component weighted formula
            // 1. Reduction (40% weight) -> Carbon Entry XP / 20 (max 100)
            // 2. Goal (30% weight) -> Goal XP / 10 (max 100)
            // 3. Challenge (20% weight) -> Challenge XP / 10 (max 100)
            // 4. Streak (10% weight) -> Streak * 5 (max 100)
            
            int streak = profile.getCurrentStreak() == null ? 0 : profile.getCurrentStreak();
                
            long carbonXp = xpLedgerRepo.findSumByUserIdAndSourceType(userId, com.ecotrack.gamification.enums.XpSourceType.CARBON_ENTRY);
            long goalXp = xpLedgerRepo.findSumByUserIdAndSourceType(userId, com.ecotrack.gamification.enums.XpSourceType.GOAL_COMPLETED);
            long challengeXp = xpLedgerRepo.findSumByUserIdAndSourceType(userId, com.ecotrack.gamification.enums.XpSourceType.CHALLENGE_COMPLETED);
            
            BigDecimal reductionFactor = BigDecimal.valueOf(Math.min(carbonXp / 20.0, 100.0));
            BigDecimal goalFactor = BigDecimal.valueOf(Math.min(goalXp / 10.0, 100.0));
            BigDecimal challengeFactor = BigDecimal.valueOf(Math.min(challengeXp / 10.0, 100.0));
            BigDecimal streakFactor = BigDecimal.valueOf(Math.min(streak * 5.0, 100.0));
            
            BigDecimal wReduction = configService.getDecimal("ECO_SCORE_WEIGHT_REDUCTION", new BigDecimal("0.40"));
            BigDecimal wGoal = configService.getDecimal("ECO_SCORE_WEIGHT_GOAL", new BigDecimal("0.30"));
            BigDecimal wChallenge = configService.getDecimal("ECO_SCORE_WEIGHT_CHALLENGE", new BigDecimal("0.20"));
            BigDecimal wStreak = configService.getDecimal("ECO_SCORE_WEIGHT_STREAK", new BigDecimal("0.10"));
            
            BigDecimal baseScore = reductionFactor.multiply(wReduction)
                    .add(goalFactor.multiply(wGoal))
                    .add(challengeFactor.multiply(wChallenge))
                    .add(streakFactor.multiply(wStreak))
                    .setScale(2, RoundingMode.HALF_UP);
            
            // Decay recovery logic (0.5 recovery per XP grant is too aggressive. Changed to 0.1)
            if (profile.getAccumulatedDecay().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal finalDecay = profile.getAccumulatedDecay().subtract(new BigDecimal("0.1"));
                profile.setAccumulatedDecay(finalDecay.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : finalDecay);
            }
            
            // Base score minus accumulated decay
            BigDecimal totalScore = baseScore.subtract(profile.getAccumulatedDecay());
            
            if (totalScore.compareTo(BigDecimal.valueOf(100)) > 0) {
                totalScore = BigDecimal.valueOf(100);
            } else if (totalScore.compareTo(BigDecimal.ZERO) < 0) {
                totalScore = BigDecimal.ZERO;
            }
            
            profile.setCurrentEcoScore(totalScore);
            profile.setLastActivityDate(LocalDate.now());
            
            profileRepository.save(profile);
            log.info("Recalculated Eco Score for user {}: {}", userId, totalScore);
        });
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
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
        
        Long lastId = -1L;
        boolean hasMore = true;
        
        while (hasMore) {
            java.util.List<com.ecotrack.gamification.entity.UserGamificationProfile> batch = 
                profileRepository.findTop500ByLastActivityDateBeforeAndUserIdGreaterThanOrderByUserIdAsc(thresholdDate, lastId);
                
            if (batch.isEmpty()) {
                hasMore = false;
                continue;
            }
            
            for (com.ecotrack.gamification.entity.UserGamificationProfile profile : batch) {
                // lastActivityDate is guaranteed to be before thresholdDate by the query, and therefore not null.
                long daysInactive = ChronoUnit.DAYS.between(profile.getLastActivityDate(), LocalDate.now());
                long daysToDecay = daysInactive - inactiveDaysThreshold;
                
                if (daysToDecay > 0) {
                    profile.setAccumulatedDecay(profile.getAccumulatedDecay().add(decayRate));
                    profileRepository.save(profile);
                    log.info("Applied Eco Score decay for user {}: new accumulated decay {}", profile.getUserId(), profile.getAccumulatedDecay());
                }
                
                lastId = profile.getUserId();
            }
            
            entityManager.flush();
            entityManager.clear();
        }
    }
    public String calculateGrade(BigDecimal score) {
        if (score == null) return "N/A";
        double val = score.doubleValue();
        if (val >= 80) return "A+";
        if (val >= 60) return "A";
        if (val >= 40) return "B";
        return "C";
    }
}
