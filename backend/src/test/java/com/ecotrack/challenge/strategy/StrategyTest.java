package com.ecotrack.challenge.strategy;

import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class StrategyTest {

    private final AchievementStrategy achievementStrategy = new AchievementStrategy();
    private final BudgetStrategy budgetStrategy = new BudgetStrategy();

    @Test
    void testAchievementStrategy() {
        // 20/30 -> ACTIVE
        assertEquals(ChallengeParticipantStatus.ACTIVE, achievementStrategy.evaluateLiveStatus(20, 30, ChallengeParticipantStatus.ACTIVE));
        
        // 30/30 -> COMPLETED
        assertEquals(ChallengeParticipantStatus.COMPLETED, achievementStrategy.evaluateLiveStatus(30, 30, ChallengeParticipantStatus.ACTIVE));
        
        // 45/30 -> COMPLETED
        assertEquals(ChallengeParticipantStatus.COMPLETED, achievementStrategy.evaluateLiveStatus(45, 30, ChallengeParticipantStatus.COMPLETED));
        
        // 31 -> 29 after correction -> remains COMPLETED
        assertEquals(ChallengeParticipantStatus.COMPLETED, achievementStrategy.evaluateLiveStatus(29, 30, ChallengeParticipantStatus.COMPLETED));
    }

    @Test
    void testBudgetStrategy() {
        // 20/50 -> WITHIN_BUDGET
        assertEquals(ChallengeParticipantStatus.WITHIN_BUDGET, budgetStrategy.evaluateLiveStatus(20, 50, ChallengeParticipantStatus.ACTIVE));
        
        // 50/50 -> WITHIN_BUDGET
        assertEquals(ChallengeParticipantStatus.WITHIN_BUDGET, budgetStrategy.evaluateLiveStatus(50, 50, ChallengeParticipantStatus.WITHIN_BUDGET));
        
        // 51/50 -> EXCEEDED
        assertEquals(ChallengeParticipantStatus.EXCEEDED, budgetStrategy.evaluateLiveStatus(51, 50, ChallengeParticipantStatus.WITHIN_BUDGET));
        
        // 51 -> 47 correction -> WITHIN_BUDGET
        assertEquals(ChallengeParticipantStatus.WITHIN_BUDGET, budgetStrategy.evaluateLiveStatus(47, 50, ChallengeParticipantStatus.EXCEEDED));
    }

    @Test
    void testSchedulerFinalEvaluation() {
        // WITHIN_BUDGET at expiry -> COMPLETED
        assertEquals(ChallengeParticipantStatus.COMPLETED, budgetStrategy.evaluateFinalStatus(40, 50, ChallengeParticipantStatus.WITHIN_BUDGET));
        
        // EXCEEDED at expiry -> FAILED
        assertEquals(ChallengeParticipantStatus.FAILED, budgetStrategy.evaluateFinalStatus(60, 50, ChallengeParticipantStatus.EXCEEDED));
    }
}
