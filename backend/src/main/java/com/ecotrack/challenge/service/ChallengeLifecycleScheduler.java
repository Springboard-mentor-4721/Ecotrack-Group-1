package com.ecotrack.challenge.service;

import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.enums.ChallengeStatus;
import com.ecotrack.challenge.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Scheduled(cron = "0 0 * * * *") // Run hourly
    @Transactional
    public void closeExpiredChallenges() {
        log.info("Checking for expired challenges");
        List<Challenge> expiredChallenges = challengeRepository.findByStatusAndEndDateBefore(
                ChallengeStatus.ACTIVE, LocalDateTime.now());
                
        for (Challenge challenge : expiredChallenges) {
            challenge.setStatus(ChallengeStatus.CLOSED);
            log.info("Closed expired challenge ID: {}", challenge.getId());
        }
        
        challengeRepository.saveAll(expiredChallenges);
    }
}
