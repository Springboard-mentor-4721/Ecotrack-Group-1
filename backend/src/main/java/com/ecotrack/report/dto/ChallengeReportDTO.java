package com.ecotrack.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeReportDTO {
    private String startDate;
    private String endDate;
    private int totalParticipated;
    private int completedChallenges;
    private long totalXpEarned;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChallengeDetail {
        private String title;
        private String category;
        private String status;
        private double progressPercentage;
        private long xpEarned;
        private String joinedDate;
        private String completedDate;
    }

    private List<ChallengeDetail> challenges;
}
