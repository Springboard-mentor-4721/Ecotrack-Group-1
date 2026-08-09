package com.ecotrack.challenge.service;

import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.entity.ChallengeParticipant;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;

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

            java.math.BigDecimal delta = extractDelta(challenge.getProgressMetric(), event.getAmount(), event.getCarbonEmission());
            if (delta != null && delta.compareTo(java.math.BigDecimal.ZERO) != 0) {
                participant.setProgress(participant.getProgress().add(delta));
                challengeRepository.incrementGlobalProgress(challenge.getId(), delta);
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
                        challenge.getRewardXp(),
                        java.util.UUID.randomUUID().toString()
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

            java.math.BigDecimal delta = extractDelta(challenge.getProgressMetric(), event.getAmount(), event.getCarbonEmission());
            if (delta != null && delta.compareTo(java.math.BigDecimal.ZERO) != 0) {
                participant.setProgress(participant.getProgress().subtract(delta));
                challengeRepository.incrementGlobalProgress(challenge.getId(), delta.negate());
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

            if (challenge.getProgressMetric() == com.ecotrack.challenge.enums.ProgressMetric.ENTRY_COUNT) {
                if (wasApplicable && !isApplicableNow) {
                    deltaProgress = java.math.BigDecimal.ONE.negate();
                } else if (!wasApplicable && isApplicableNow) {
                    deltaProgress = java.math.BigDecimal.ONE;
                }
            } else {
                java.math.BigDecimal oldVal = extractDelta(challenge.getProgressMetric(), event.getOldAmount(), event.getOldCarbonEmission());
                java.math.BigDecimal newVal = extractDelta(challenge.getProgressMetric(), event.getNewAmount(), event.getNewCarbonEmission());
                
                if (wasApplicable && !isApplicableNow) {
                    deltaProgress = oldVal.negate();
                } else if (!wasApplicable && isApplicableNow) {
                    deltaProgress = newVal;
                } else if (wasApplicable && isApplicableNow) {
                    deltaProgress = newVal.subtract(oldVal);
                }
            }

            if (deltaProgress.compareTo(java.math.BigDecimal.ZERO) != 0) {
                participant.setProgress(participant.getProgress().add(deltaProgress));
                challengeRepository.incrementGlobalProgress(challenge.getId(), deltaProgress);
                
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
                            challenge.getRewardXp(),
                            java.util.UUID.randomUUID().toString()
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

    private java.math.BigDecimal extractDelta(com.ecotrack.challenge.enums.ProgressMetric metric, java.math.BigDecimal amount, java.math.BigDecimal carbonEmission) {
        if (metric == com.ecotrack.challenge.enums.ProgressMetric.ENTRY_COUNT) return java.math.BigDecimal.ONE;
        if (metric == com.ecotrack.challenge.enums.ProgressMetric.QUANTITY) return amount != null ? amount : java.math.BigDecimal.ZERO;
        if (metric == com.ecotrack.challenge.enums.ProgressMetric.CARBON_EMISSION) return carbonEmission != null ? carbonEmission : java.math.BigDecimal.ZERO;
        return java.math.BigDecimal.ZERO;
    }
}
