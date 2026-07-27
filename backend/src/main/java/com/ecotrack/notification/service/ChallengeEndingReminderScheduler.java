package com.ecotrack.notification.service;

import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.entity.ChallengeParticipant;
import com.ecotrack.challenge.repository.ChallengeRepository;
import com.ecotrack.challenge.enums.ChallengeStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import com.ecotrack.challenge.repository.ChallengeParticipantRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeEndingReminderScheduler {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipantRepository participantRepository;
    private final NotificationService notificationService;

    // Run every day at 9 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void sendEndingSoonReminders() {
        log.info("Checking for challenges ending in 24 hours...");
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);
        
        List<Challenge> endingSoon = challengeRepository.findByStatusAndEndDateBetween(
                ChallengeStatus.ACTIVE, now, tomorrow.plusHours(24));
                
        for (Challenge challenge : endingSoon) {
            List<ChallengeParticipant> participants = participantRepository.findByChallengeId(challenge.getId());
            for (ChallengeParticipant participant : participants) {
                String type = "CHALLENGE_ENDING";
                String title = "Challenge Ending Soon!";
                String message = "The challenge '" + challenge.getTitle() + "' ends soon. Complete your goals!";
                try {
                    notificationService.createNotification(
                            participant.getUserId(), type, title, message, "CHALLENGE", challenge.getId());
                } catch (Exception e) {
                    log.error("Failed to send ending reminder to user {}", participant.getUserId(), e);
                }
            }
        }
    }
}
