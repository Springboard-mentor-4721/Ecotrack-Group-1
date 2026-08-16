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
        @com.fasterxml.jackson.annotation.JsonProperty("isAutomatic")
        private boolean isAutomatic;
        private BigDecimal targetValue;
        private String unit;
        
        // Manual Goal fields
        private BigDecimal progressInPeriod;
        private BigDecimal cumulativeProgress;
        private BigDecimal progressPercentage;
        
        // Automatic Budget fields
        private BigDecimal budgetUsedInPeriod;
        private BigDecimal budgetCumulativeUsed;
        private BigDecimal budgetRemaining;
        private BigDecimal budgetUsagePercentage;
        
        private String targetDate;
        private String status;
        private boolean needsAttention;
    }
}
