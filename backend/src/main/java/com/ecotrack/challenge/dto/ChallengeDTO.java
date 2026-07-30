package com.ecotrack.challenge.dto;

import com.ecotrack.challenge.enums.ChallengeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeDTO {
    private Long id;
    private String title;
    private String description;
    private String typeCode;
    private ChallengeStatus status;
    private Integer targetValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Long linkedCategoryId;

    private Integer rewardXp;

    private com.ecotrack.challenge.enums.ProgressType progressType;

    private java.math.BigDecimal communityProgress;
}
