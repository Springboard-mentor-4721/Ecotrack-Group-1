package com.ecotrack.challenge.strategy;

import com.ecotrack.challenge.enums.ChallengeEvaluationType;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;

public interface ChallengeEvaluationStrategy {
    
    boolean supports(ChallengeEvaluationType type);

    ChallengeParticipantStatus evaluateLiveStatus(double currentProgress, double targetValue, ChallengeParticipantStatus currentStatus);

    ChallengeParticipantStatus evaluateFinalStatus(double currentProgress, double targetValue, ChallengeParticipantStatus currentStatus);

}
