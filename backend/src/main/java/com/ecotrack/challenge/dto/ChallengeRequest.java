package com.ecotrack.challenge.dto;

import com.ecotrack.challenge.enums.ChallengeStatus;
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

    private Integer rewardXp;

    private com.ecotrack.challenge.enums.ProgressType progressType;
}
