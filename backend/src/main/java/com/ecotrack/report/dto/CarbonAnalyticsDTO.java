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
public class CarbonAnalyticsDTO {
    private String startDate;
    private String endDate;

    // Summary
    private BigDecimal totalEmissions;
    private BigDecimal averagePerDay;
    private String highestCategory;
    private long entryCount;

    // Period Comparison
    private BigDecimal previousPeriodTotal;
    private BigDecimal changePercentage;
    private String direction; // IMPROVED, INCREASED, NO_PREVIOUS_DATA

    // Trend
    private List<CarbonTrendPointDTO> trend;

    // Categories
    private List<CarbonCategoryRankingDTO> categoryRankings;

    // Insights
    private List<String> insights;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarbonTrendPointDTO {
        private String date;
        private BigDecimal emission;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarbonCategoryRankingDTO {
        private int rank;
        private String category;
        private BigDecimal absoluteEmissions;
        private BigDecimal percentage;
    }
}
