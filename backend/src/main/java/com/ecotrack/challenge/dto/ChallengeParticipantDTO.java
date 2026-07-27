package com.ecotrack.challenge.dto;

import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeParticipantDTO {
    private Long id;
    private Long challengeId;
    private Long userId;
    private Integer progress;
    private ChallengeParticipantStatus status;
    private LocalDateTime joinedAt;
    private LocalDateTime completedAt;
}
