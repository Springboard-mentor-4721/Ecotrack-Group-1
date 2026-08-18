package com.ecotrack.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonReportDTO {
    private String startDate;
    private String endDate;
    private String userName;
    private String userEmail;
    private BigDecimal totalEmissions;
    private Map<String, BigDecimal> emissionsByCategory;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarbonEntryDetail {
        private String date;
        private String category;
        private String subCategory;
        private BigDecimal emission;
        private String description;
    }
    
    private List<CarbonEntryDetail> entries;
}
