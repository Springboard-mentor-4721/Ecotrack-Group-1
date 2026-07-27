package com.ecotrack.challenge.service;

import com.ecotrack.challenge.entity.ChallengeParticipant;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
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
    private final ApplicationEventPublisher eventPublisher;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void handleCarbonEntryCreated(CarbonEntryCreatedEvent event) {
        log.info("Processing carbon entry {} for challenges user {}", event.getEntryId(), event.getUserId());
        
        List<ChallengeParticipant> activeParticipations = participantRepository.findByUserIdAndStatus(
                event.getUserId(), ChallengeParticipantStatus.ACTIVE);
                
        for (ChallengeParticipant participant : activeParticipations) {
            // Simplified progress: increment by 1 for each carbon entry
            participant.setProgress(participant.getProgress() + 1);
            
            if (participant.getProgress() >= participant.getChallenge().getTargetValue()) {
                participant.setStatus(ChallengeParticipantStatus.COMPLETED);
                participant.setCompletedAt(LocalDateTime.now());
                eventPublisher.publishEvent(new ChallengeCompletedEvent(
                        participant.getUserId(),
                        participant.getChallenge().getId(),
                        participant.getChallenge().getTitle()
                ));
            }
            
            participantRepository.save(participant);
        }
    }
}
