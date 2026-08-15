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
    private java.math.BigDecimal progress;
    private ChallengeParticipantStatus status;
    private LocalDateTime joinedAt;
    private LocalDateTime completedAt;
    private String userName;
    private String challengeTitle;
    private Integer targetValue;
    private com.ecotrack.challenge.enums.ProgressMetric progressMetric;
    private ChallengeDTO challenge;
}
