package com.ecotrack.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserContextDTO {
    private Long userId;
    private List<EligibleTargetDTO> eligibleTargets;
    private List<String> lifestyleConstraints;
    private List<String> previousRecommendations;
}
