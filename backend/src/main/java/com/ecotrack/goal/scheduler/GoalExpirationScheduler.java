package com.ecotrack.goal.scheduler;

import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.enums.GoalStatus;
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
public class GoalExpirationScheduler {

    private final GoalRepository goalRepository;

    @Scheduled(cron = "0 0 0 * * ?") // Runs daily at midnight
    @Transactional
    public void markOverdueGoalsAsExpired() {
        log.info("Running Goal Expiration Scheduler...");
        LocalDate today = LocalDate.now();
        List<Goal> overdueGoals = goalRepository.findByStatusAndTargetDateBefore(GoalStatus.ACTIVE, today);
        
        if (!overdueGoals.isEmpty()) {
            log.info("Found {} overdue goals. Marking as EXPIRED.", overdueGoals.size());
            overdueGoals.forEach(goal -> goal.setStatus(GoalStatus.EXPIRED));
            goalRepository.saveAll(overdueGoals);
        } else {
            log.info("No overdue goals found.");
        }
    }
}
