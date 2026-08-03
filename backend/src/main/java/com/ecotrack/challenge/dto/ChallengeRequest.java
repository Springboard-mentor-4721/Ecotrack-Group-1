package com.ecotrack.challenge.dto;

import com.ecotrack.challenge.enums.ChallengeStatus;
import com.ecotrack.challenge.enums.TrackingMethod;
import com.ecotrack.challenge.entity.ChallengeRules;
import jakarta.validation.constraints.FutureOrPresent;
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
    
    @NotBlank
    private String typeCode;
    
    @NotNull
    @Positive
    private Integer targetValue;
    
    @NotNull
    @FutureOrPresent
    private LocalDateTime startDate;
    
    @NotNull
    private LocalDateTime endDate;

    private Long linkedCategoryId;
    private String carbonCategoryCode;

    private Integer rewardXp;

    private com.ecotrack.challenge.enums.ProgressType progressType;
    private TrackingMethod trackingMethod;
    private ChallengeRules rulesConfig;
}
