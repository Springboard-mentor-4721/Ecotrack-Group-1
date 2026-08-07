package com.ecotrack.challenge.service;

import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.entity.ChallengeParticipant;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import com.ecotrack.challenge.enums.ProgressType;
import com.ecotrack.challenge.enums.TrackingMethod;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import com.ecotrack.challenge.repository.ChallengeRepository;
import com.ecotrack.event.CarbonEntryCreatedEvent;
import com.ecotrack.event.CarbonEntryDeletedEvent;
import com.ecotrack.event.CarbonEntryUpdatedEvent;
import com.ecotrack.event.ChallengeCompletedEvent;
import com.ecotrack.challenge.strategy.StrategyResolver;
import com.ecotrack.challenge.strategy.ChallengeEvaluationStrategy;
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
    private final StrategyResolver strategyResolver;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void handleCarbonEntryCreated(CarbonEntryCreatedEvent event) {
        log.info("Processing carbon entry {} for challenges user {}", event.getEntryId(), event.getUserId());
        
        List<ChallengeParticipantStatus> validStatuses = List.of(
                ChallengeParticipantStatus.ACTIVE,
                ChallengeParticipantStatus.WITHIN_BUDGET,
                ChallengeParticipantStatus.EXCEEDED
        );
        List<ChallengeParticipant> activeParticipations = participantRepository.findByUserIdAndStatusIn(
                event.getUserId(), validStatuses);
        activeParticipations.sort(java.util.Comparator.comparing(p -> p.getChallenge().getId()));
                
        for (ChallengeParticipant p : activeParticipations) {
            ChallengeParticipant participant = participantRepository.findByChallengeIdAndUserIdForUpdate(p.getChallenge().getId(), p.getUserId()).get();
            var challenge = participant.getChallenge();
            
            if (!isApplicable(challenge, event.getCategoryId(), event.getSubCategoryId())) {
                continue;
            }

            if (challenge.getProgressType() == ProgressType.COUNT) {
                participant.setProgress(participant.getProgress().add(java.math.BigDecimal.ONE));
                challengeRepository.incrementCommunityProgress(challenge.getId(), java.math.BigDecimal.ONE);
            } else if (challenge.getProgressType() == ProgressType.AMOUNT) {
                if (event.getCarbonEmission() != null) {
                    participant.setProgress(participant.getProgress().add(event.getCarbonEmission()));
                    challengeRepository.incrementCommunityProgress(challenge.getId(), event.getCarbonEmission());
                }
            }
            
            ChallengeEvaluationStrategy strategy = strategyResolver.resolve(challenge.getChallengeEvaluationType());
            ChallengeParticipantStatus oldStatus = participant.getStatus();
            ChallengeParticipantStatus newStatus = strategy.evaluateLiveStatus(participant.getProgress().doubleValue(), (double) challenge.getTargetValue(), oldStatus);
            
            participant.setStatus(newStatus);
            
            if (newStatus == ChallengeParticipantStatus.COMPLETED && oldStatus != ChallengeParticipantStatus.COMPLETED) {
                participant.setCompletedAt(LocalDateTime.now());
                eventPublisher.publishEvent(new ChallengeCompletedEvent(
                        participant.getUserId(),
                        challenge.getId(),
                        challenge.getTitle(),
                        challenge.getRewardXp()
                ));
            }
            
            participantRepository.save(participant);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void handleCarbonEntryDeleted(CarbonEntryDeletedEvent event) {
        log.info("Processing deletion of carbon entry {} for challenges user {}", event.getEntryId(), event.getUserId());
        
        List<ChallengeParticipantStatus> validStatuses = List.of(
                ChallengeParticipantStatus.ACTIVE,
                ChallengeParticipantStatus.WITHIN_BUDGET,
                ChallengeParticipantStatus.EXCEEDED
        );
        List<ChallengeParticipant> activeParticipations = participantRepository.findByUserIdAndStatusIn(
                event.getUserId(), validStatuses);
        activeParticipations.sort(java.util.Comparator.comparing(p -> p.getChallenge().getId()));
                
        for (ChallengeParticipant p : activeParticipations) {
            ChallengeParticipant participant = participantRepository.findByChallengeIdAndUserIdForUpdate(p.getChallenge().getId(), p.getUserId()).get();
            var challenge = participant.getChallenge();
            
            if (!isApplicable(challenge, event.getCategoryId(), event.getSubCategoryId())) {
                continue;
            }

            if (challenge.getProgressType() == ProgressType.COUNT) {
                participant.setProgress(participant.getProgress().subtract(java.math.BigDecimal.ONE));
                challengeRepository.incrementCommunityProgress(challenge.getId(), java.math.BigDecimal.ONE.negate());
            } else if (challenge.getProgressType() == ProgressType.AMOUNT) {
                if (event.getCarbonEmission() != null) {
                    participant.setProgress(participant.getProgress().subtract(event.getCarbonEmission()));
                    challengeRepository.incrementCommunityProgress(challenge.getId(), event.getCarbonEmission().negate());
                }
            }
            
            ChallengeEvaluationStrategy strategy = strategyResolver.resolve(challenge.getChallengeEvaluationType());
            ChallengeParticipantStatus oldStatus = participant.getStatus();
            ChallengeParticipantStatus newStatus = strategy.evaluateLiveStatus(participant.getProgress().doubleValue(), (double) challenge.getTargetValue(), oldStatus);
            
            participant.setStatus(newStatus);
            participantRepository.save(participant);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void handleCarbonEntryUpdated(CarbonEntryUpdatedEvent event) {
        log.info("Processing update of carbon entry {} for challenges user {}", event.getEntryId(), event.getUserId());
        
        List<ChallengeParticipantStatus> validStatuses = List.of(
                ChallengeParticipantStatus.ACTIVE,
                ChallengeParticipantStatus.WITHIN_BUDGET,
                ChallengeParticipantStatus.EXCEEDED
        );
        List<ChallengeParticipant> activeParticipations = participantRepository.findByUserIdAndStatusIn(
                event.getUserId(), validStatuses);
        activeParticipations.sort(java.util.Comparator.comparing(p -> p.getChallenge().getId()));
                
        for (ChallengeParticipant p : activeParticipations) {
            ChallengeParticipant participant = participantRepository.findByChallengeIdAndUserIdForUpdate(p.getChallenge().getId(), p.getUserId()).get();
            var challenge = participant.getChallenge();
            
            boolean wasApplicable = isApplicable(challenge, event.getOldCategoryId(), event.getOldSubCategoryId());
            boolean isApplicableNow = isApplicable(challenge, event.getNewCategoryId(), event.getNewSubCategoryId());
            
            if (!wasApplicable && !isApplicableNow) {
                continue;
            }

            java.math.BigDecimal deltaProgress = java.math.BigDecimal.ZERO;

            if (challenge.getProgressType() == ProgressType.COUNT) {
                if (wasApplicable && !isApplicableNow) {
                    deltaProgress = java.math.BigDecimal.ONE.negate();
                } else if (!wasApplicable && isApplicableNow) {
                    deltaProgress = java.math.BigDecimal.ONE;
                }
            } else if (challenge.getProgressType() == ProgressType.AMOUNT) {
                if (wasApplicable && !isApplicableNow) {
                    if (event.getOldCarbonEmission() != null) deltaProgress = event.getOldCarbonEmission().negate();
                } else if (!wasApplicable && isApplicableNow) {
                    if (event.getNewCarbonEmission() != null) deltaProgress = event.getNewCarbonEmission();
                } else if (wasApplicable && isApplicableNow) {
                    java.math.BigDecimal oldE = event.getOldCarbonEmission() != null ? event.getOldCarbonEmission() : java.math.BigDecimal.ZERO;
                    java.math.BigDecimal newE = event.getNewCarbonEmission() != null ? event.getNewCarbonEmission() : java.math.BigDecimal.ZERO;
                    deltaProgress = newE.subtract(oldE);
                }
            }

            if (deltaProgress.compareTo(java.math.BigDecimal.ZERO) != 0) {
                participant.setProgress(participant.getProgress().add(deltaProgress));
                challengeRepository.incrementCommunityProgress(challenge.getId(), deltaProgress);
                
                ChallengeEvaluationStrategy strategy = strategyResolver.resolve(challenge.getChallengeEvaluationType());
                ChallengeParticipantStatus oldStatus = participant.getStatus();
                ChallengeParticipantStatus newStatus = strategy.evaluateLiveStatus(participant.getProgress().doubleValue(), (double) challenge.getTargetValue(), oldStatus);
                
                participant.setStatus(newStatus);
                if (newStatus == ChallengeParticipantStatus.COMPLETED && oldStatus != ChallengeParticipantStatus.COMPLETED) {
                    participant.setCompletedAt(LocalDateTime.now());
                    eventPublisher.publishEvent(new ChallengeCompletedEvent(
                            participant.getUserId(),
                            challenge.getId(),
                            challenge.getTitle(),
                            challenge.getRewardXp()
                    ));
                }
                participantRepository.save(participant);
            }
        }
    }

    private boolean isApplicable(Challenge challenge, Long categoryId, Long subCategoryId) {
        if (challenge.getTrackingMethod() == TrackingMethod.MANUAL) {
            return false;
        }
        
        if (challenge.getLinkedCategoryId() != null && !challenge.getLinkedCategoryId().equals(categoryId)) {
            return false;
        }

        var rules = challenge.getRulesConfig();
        if (rules != null) {
            if (rules.blockedSubcategoryIds() != null && rules.blockedSubcategoryIds().contains(subCategoryId)) {
                return false;
            }
            if (rules.allowedSubcategoryIds() != null && !rules.allowedSubcategoryIds().isEmpty()) {
                if (!rules.allowedSubcategoryIds().contains(subCategoryId)) {
                    return false;
                }
            }
        }
        
        return true;
    }
}
