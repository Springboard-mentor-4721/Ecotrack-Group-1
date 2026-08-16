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
    private List<CategorySummaryDTO> categorySummaries;
    private List<GoalSummaryDTO> goals;
    private List<String> lifestyleConstraints;
    private List<String> previousRecommendations;
    private List<EligibleTargetDTO> eligibleTargets; // Deprecated, kept for backward compatibility if needed

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategorySummaryDTO {
        private String categoryCode;
        private Double totalVolume;
        private Long entryCount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GoalSummaryDTO {
        private String title;
        private String type;
        private Double targetValue;
        private Double currentValue;
        private String status;
    }
}
