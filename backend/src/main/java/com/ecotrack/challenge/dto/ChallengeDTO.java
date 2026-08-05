package com.ecotrack.challenge.dto;

import com.ecotrack.challenge.enums.ChallengeStatus;
import com.ecotrack.challenge.enums.TrackingMethod;
import com.ecotrack.challenge.entity.RulesConfig;
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

    private TrackingMethod trackingMethod;
    private com.ecotrack.challenge.enums.ChallengeEvaluationType challengeEvaluationType;
    private RulesConfig rulesConfig;
    private java.math.BigDecimal communityProgress;
    
    private Long participantCount;
    private String imageUrl;
}
