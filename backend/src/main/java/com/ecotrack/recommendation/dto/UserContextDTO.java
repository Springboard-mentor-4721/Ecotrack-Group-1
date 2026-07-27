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
    private String recentCarbonActivity; // summarized from recent carbon entries
    private String activeGoals; // summarized from active goals
    private Integer currentEcoScore; // from GamificationProfile
    private String interests; // could be extracted from User profile or passed directly
}
