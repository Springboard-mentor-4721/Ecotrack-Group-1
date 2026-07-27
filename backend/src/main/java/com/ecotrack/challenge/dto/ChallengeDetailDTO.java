package com.ecotrack.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ChallengeDetailDTO extends ChallengeDTO {
    private Long participantCount;
    private ChallengeParticipantDTO userProgress;
}
