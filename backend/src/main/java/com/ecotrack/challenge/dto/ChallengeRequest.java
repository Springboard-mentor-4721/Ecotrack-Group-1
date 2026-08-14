package com.ecotrack.challenge.dto;

import com.ecotrack.challenge.enums.ChallengeStatus;
import com.ecotrack.challenge.enums.TrackingMethod;
import com.ecotrack.challenge.entity.RulesConfig;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeRequest {
    @NotBlank
    private String title;
    
    @NotBlank
    private String description;
    

    @NotNull
    @jakarta.validation.constraints.Min(0)
    private Integer targetValue;
    
    @NotNull
    private LocalDateTime startDate;
    
    @NotNull
    private LocalDateTime endDate;

    private Long linkedCategoryId;
    private String carbonCategoryCode;

    private Integer rewardXp;

    private com.ecotrack.challenge.enums.ProgressMetric progressMetric;
    private TrackingMethod trackingMethod;
    private com.ecotrack.challenge.enums.ChallengeEvaluationType challengeEvaluationType;
    private RulesConfig rulesConfig;
    private String imageUrl;
    
    private Long badgeId;
}
