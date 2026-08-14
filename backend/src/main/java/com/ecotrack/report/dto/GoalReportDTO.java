package com.ecotrack.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalReportDTO {
    private String startDate;
    private String endDate;
    private int totalGoals;
    private int activeGoals;
    private int completedGoals;
    private int failedGoals;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoalDetail {
        private String title;
        private String type;
        private String status;
        private BigDecimal targetValue;
        private BigDecimal currentValue;
        private String unit;
        private String targetDate;
        private BigDecimal progressPercentage;
    }

    private List<GoalDetail> goals;
}
