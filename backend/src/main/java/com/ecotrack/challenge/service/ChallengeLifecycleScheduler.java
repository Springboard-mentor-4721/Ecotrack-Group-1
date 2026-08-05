package com.ecotrack.challenge.service;

import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.enums.ChallengeStatus;
import com.ecotrack.challenge.entity.ChallengeParticipant;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import com.ecotrack.challenge.repository.ChallengeRepository;
import com.ecotrack.challenge.strategy.ChallengeEvaluationStrategy;
import com.ecotrack.challenge.strategy.StrategyResolver;
import com.ecotrack.event.ChallengeCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeLifecycleScheduler {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipantRepository participantRepository;
    private final StrategyResolver strategyResolver;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(cron = "0 0 * * * *") // Run hourly
    @Transactional
    public void processChallengeLifecycle() {
        log.info("Processing challenge lifecycle transitions");
        
        // 1. Close expired ACTIVE challenges
        List<Challenge> expiredChallenges = challengeRepository.findByStatusAndEndDateBefore(
                ChallengeStatus.ACTIVE, LocalDateTime.now());
                
        for (Challenge challenge : expiredChallenges) {
            challenge.setStatus(ChallengeStatus.CLOSED);
            log.info("Closed expired challenge ID: {}", challenge.getId());
            
            List<ChallengeParticipant> participants = participantRepository.findByChallengeId(challenge.getId());
            ChallengeEvaluationStrategy strategy = strategyResolver.resolve(challenge.getChallengeEvaluationType());
            
            for (ChallengeParticipant p : participants) {
                if (p.getStatus() == ChallengeParticipantStatus.COMPLETED || p.getStatus() == ChallengeParticipantStatus.FAILED || p.getStatus() == ChallengeParticipantStatus.DROPPED) {
                    continue;
                }
                
                ChallengeParticipantStatus oldStatus = p.getStatus();
                ChallengeParticipantStatus newStatus = strategy.evaluateFinalStatus(p.getProgress(), challenge.getTargetValue(), oldStatus);
                
                if (newStatus != oldStatus) {
                    p.setStatus(newStatus);
                    if (newStatus == ChallengeParticipantStatus.COMPLETED) {
                        p.setCompletedAt(LocalDateTime.now());
                        eventPublisher.publishEvent(new ChallengeCompletedEvent(
                                p.getUserId(),
                                challenge.getId(),
                                challenge.getTitle(),
                                challenge.getRewardXp()
                        ));
                    }
                }
            }
            participantRepository.saveAll(participants);
        }
        
        if (!expiredChallenges.isEmpty()) {
            challengeRepository.saveAll(expiredChallenges);
        }

        // 2. Activate UPCOMING challenges
        List<Challenge> upcomingChallenges = challengeRepository.findByStatusAndStartDateBefore(
                ChallengeStatus.UPCOMING, LocalDateTime.now());
                
        for (Challenge challenge : upcomingChallenges) {
            challenge.setStatus(ChallengeStatus.ACTIVE);
            log.info("Activated upcoming challenge ID: {}", challenge.getId());
        }
        
        if (!upcomingChallenges.isEmpty()) {
            challengeRepository.saveAll(upcomingChallenges);
        }
    }
}
