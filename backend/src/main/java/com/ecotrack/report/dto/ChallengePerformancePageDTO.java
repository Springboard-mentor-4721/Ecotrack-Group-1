package com.ecotrack.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengePerformancePageDTO {
    private String startDate;
    private String endDate;
    
    private List<ChallengePerformanceDTO> challenges;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean hasNext;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChallengePerformanceDTO {
        private Long challengeId;
        private String title;
        private String category;
        private String joinedDate;
        private String completedDate;
        private String status;
        private long rewardXp;
        private BigDecimal progressPercentage;
    }
}
