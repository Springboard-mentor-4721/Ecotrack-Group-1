package com.ecotrack.challenge.strategy;

import com.ecotrack.challenge.enums.ChallengeEvaluationType;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import org.springframework.stereotype.Component;

@Component
public class BudgetStrategy implements ChallengeEvaluationStrategy {

    @Override
    public boolean supports(ChallengeEvaluationType type) {
        return type == ChallengeEvaluationType.BUDGET;
    }

    @Override
    public ChallengeParticipantStatus evaluateLiveStatus(double currentProgress, double targetValue, ChallengeParticipantStatus currentStatus) {
        if (currentStatus == ChallengeParticipantStatus.COMPLETED || currentStatus == ChallengeParticipantStatus.FAILED || currentStatus == ChallengeParticipantStatus.DROPPED) {
            return currentStatus;
        }
        if (currentProgress > targetValue) {
            return ChallengeParticipantStatus.EXCEEDED;
        }
        return ChallengeParticipantStatus.WITHIN_BUDGET;
    }

    @Override
    public ChallengeParticipantStatus evaluateFinalStatus(double currentProgress, double targetValue, ChallengeParticipantStatus currentStatus) {
        if (currentStatus == ChallengeParticipantStatus.COMPLETED || currentStatus == ChallengeParticipantStatus.FAILED || currentStatus == ChallengeParticipantStatus.DROPPED) {
            return currentStatus;
        }
        if (currentProgress <= targetValue) {
            return ChallengeParticipantStatus.COMPLETED;
        }
        return ChallengeParticipantStatus.FAILED;
    }
}
