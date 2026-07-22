package com.ecotrack.goal.scheduler;

import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.entity.enums.GoalStatus;
import com.ecotrack.goal.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class GoalExpiryScheduler {

    private final GoalRepository goalRepository;

    /**
     * Nightly execution at midnight.
     * Transitions any ACTIVE goals whose target date is in the past to EXPIRED.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void expireOverdueGoals() {
        log.info("Starting nightly Goal Expiry Scheduler job...");

        LocalDate today = LocalDate.now();
        List<Goal> overdueGoals = goalRepository.findByTargetDateBeforeAndStatus(today, GoalStatus.ACTIVE);

        if (overdueGoals.isEmpty()) {
            log.info("No overdue ACTIVE goals found. Expiry scheduler finished.");
            return;
        }

        int expiredCount = 0;
        for (Goal goal : overdueGoals) {
            log.debug("Expiring goal ID: {} for user: {}", goal.getId(), goal.getUser().getId());
            goal.setStatus(GoalStatus.EXPIRED);
            expiredCount++;
        }

        goalRepository.saveAll(overdueGoals);

        log.info("Goal Expiry Scheduler finished successfully. Expired {} goals.", expiredCount);
    }
}
