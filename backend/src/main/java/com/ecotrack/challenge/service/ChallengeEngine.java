package com.ecotrack.challenge.service;

import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.entity.ChallengeParticipant;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import com.ecotrack.challenge.enums.ProgressType;
import com.ecotrack.challenge.enums.TrackingMethod;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import com.ecotrack.challenge.repository.ChallengeRepository;
import com.ecotrack.event.CarbonEntryCreatedEvent;
import com.ecotrack.event.ChallengeCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeEngine {

    private final ChallengeParticipantRepository participantRepository;
    private final ChallengeRepository challengeRepository;
    private final ApplicationEventPublisher eventPublisher;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void handleCarbonEntryCreated(CarbonEntryCreatedEvent event) {
        log.info("Processing carbon entry {} for challenges user {}", event.getEntryId(), event.getUserId());
        
        List<ChallengeParticipant> activeParticipations = participantRepository.findByUserIdAndStatus(
                event.getUserId(), ChallengeParticipantStatus.ACTIVE);
                
        for (ChallengeParticipant participant : activeParticipations) {
            var challenge = participant.getChallenge();
            
            if (!isApplicable(challenge, event)) {
                continue;
            }

            if (challenge.getProgressType() == ProgressType.COUNT) {
                participant.setProgress(participant.getProgress() + 1);
                challenge.setCommunityProgress(challenge.getCommunityProgress().add(java.math.BigDecimal.ONE));
            } else if (challenge.getProgressType() == ProgressType.AMOUNT) {
                if (event.getCarbonEmission() != null) {
                    participant.setProgress(participant.getProgress() + event.getCarbonEmission().intValue());
                    challenge.setCommunityProgress(challenge.getCommunityProgress().add(event.getCarbonEmission()));
                }
            }
            
            if (participant.getProgress() >= challenge.getTargetValue()) {
                participant.setStatus(ChallengeParticipantStatus.COMPLETED);
                participant.setCompletedAt(LocalDateTime.now());
                eventPublisher.publishEvent(new ChallengeCompletedEvent(
                        participant.getUserId(),
                        challenge.getId(),
                        challenge.getTitle(),
                        challenge.getRewardXp()
                ));
            }
            
            participantRepository.save(participant);
            challengeRepository.save(challenge);
        }
    }

    private boolean isApplicable(Challenge challenge, CarbonEntryCreatedEvent event) {
        if (challenge.getTrackingMethod() == TrackingMethod.MANUAL) {
            return false;
        }
        
        if (challenge.getLinkedCategoryId() != null && !challenge.getLinkedCategoryId().equals(event.getCategoryId())) {
            return false;
        }

        var rules = challenge.getRulesConfig();
        if (rules != null) {
            if (rules.getBlockedSubcategories() != null && rules.getBlockedSubcategories().contains(event.getSubCategoryId())) {
                return false;
            }
            if (rules.getAllowedSubcategories() != null && !rules.getAllowedSubcategories().isEmpty()) {
                if (!rules.getAllowedSubcategories().contains(event.getSubCategoryId())) {
                    return false;
                }
            }
        }
        
        return true;
    }
}
