package com.ecotrack.challenge.strategy;

import com.ecotrack.challenge.enums.ChallengeEvaluationType;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import org.springframework.stereotype.Component;

@Component
public class AchievementStrategy implements ChallengeEvaluationStrategy {

    @Override
    public boolean supports(ChallengeEvaluationType type) {
        return type == ChallengeEvaluationType.ACHIEVEMENT;
    }

    @Override
    public ChallengeParticipantStatus evaluateLiveStatus(double currentProgress, double targetValue, ChallengeParticipantStatus currentStatus) {
        if (currentStatus == ChallengeParticipantStatus.COMPLETED) {
            return ChallengeParticipantStatus.COMPLETED; // Once completed, always completed
        }
        if (currentProgress >= targetValue) {
            return ChallengeParticipantStatus.COMPLETED;
        }
        return currentStatus == null ? ChallengeParticipantStatus.ACTIVE : currentStatus;
    }

    @Override
    public ChallengeParticipantStatus evaluateFinalStatus(double currentProgress, double targetValue, ChallengeParticipantStatus currentStatus) {
        if (currentStatus == ChallengeParticipantStatus.COMPLETED || currentStatus == ChallengeParticipantStatus.FAILED || currentStatus == ChallengeParticipantStatus.DROPPED) {
            return currentStatus;
        }
        if (currentProgress >= targetValue) {
            return ChallengeParticipantStatus.COMPLETED;
        }
        return ChallengeParticipantStatus.FAILED;
    }
}
