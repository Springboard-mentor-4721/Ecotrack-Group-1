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
public class GoalPerformancePageDTO {
    private String startDate;
    private String endDate;
    
    private List<GoalPerformanceDTO> goals;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean hasNext;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoalPerformanceDTO {
        private Long goalId;
        private String goalName;
        private String goalType; // MANUAL, AUTO
        private BigDecimal targetValue;
        private String unit;
        private BigDecimal progressInPeriod;
        private BigDecimal cumulativeProgress;
        private BigDecimal progressPercentage;
        private String targetDate;
        private String status;
        private boolean needsAttention;
    }
}
