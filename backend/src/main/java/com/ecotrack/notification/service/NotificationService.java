package com.ecotrack.notification.service;

import com.ecotrack.event.BadgeUnlockedEvent;
import com.ecotrack.event.ChallengeCompletedEvent;
import com.ecotrack.event.GoalCompletedEvent;
import com.ecotrack.event.LevelUpEvent;
import com.ecotrack.notification.entity.Notification;
import com.ecotrack.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailNotificationService emailNotificationService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createNotification(Long userId, String type, String title, String message, String entityType, Long entityId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .entityType(entityType)
                .entityId(entityId)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleBadgeUnlocked(BadgeUnlockedEvent event) {
        String type = "BADGE_EARNED";
        String title = "Badge Unlocked!";
        String message = "Congratulations! You have unlocked a new badge!";
        createNotification(event.getUserId(), type, title, message, "BADGE", event.getBadgeId());
        emailNotificationService.sendEmailIfEnabled(event.getUserId(), type, title, message);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleLevelUp(LevelUpEvent event) {
        String type = "LEVEL_UP";
        String title = "Leveled Up!";
        String message = "You reached level " + event.getNewLevel();
        createNotification(event.getUserId(), type, title, message, "LEVEL", null);
        // No email requested for Level Up, but can be added.
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleChallengeCompleted(ChallengeCompletedEvent event) {
        String type = "CHALLENGE_COMPLETED";
        String title = "Challenge Completed!";
        String message = "You have completed the challenge: " + event.getChallengeTitle();
        createNotification(event.getUserId(), type, title, message, "CHALLENGE", event.getChallengeId());
        emailNotificationService.sendEmailIfEnabled(event.getUserId(), type, title, message);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleGoalCompleted(GoalCompletedEvent event) {
        String type = "GOAL_ACHIEVED";
        String title = "Goal Achieved!";
        String message = "You have achieved your goal!";
        createNotification(event.getUserId(), type, title, message, "GOAL", event.getGoalId());
        emailNotificationService.sendEmailIfEnabled(event.getUserId(), type, title, message);
    }
}
