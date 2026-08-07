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
    private ChallengeStatus status;
    private Integer targetValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Long linkedCategoryId;
    private String carbonCategoryCode;

    private Integer rewardXp;

    private com.ecotrack.challenge.enums.ProgressMetric progressMetric;

    private TrackingMethod trackingMethod;
    private com.ecotrack.challenge.enums.ChallengeEvaluationType challengeEvaluationType;
    private RulesConfig rulesConfig;
    private java.math.BigDecimal globalProgress;
    
    private String derivedUnit;
    private Long participantCount;
    private String imageUrl;
}
