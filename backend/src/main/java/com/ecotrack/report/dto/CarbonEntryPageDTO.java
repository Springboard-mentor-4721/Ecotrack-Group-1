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
public class CarbonEntryPageDTO {
    private String startDate;
    private String endDate;
    
    private List<CarbonEntryDTO> entries;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean hasNext;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarbonEntryDTO {
        private String date;
        private String activity;
        private String category;
        private String amount; // e.g. "18 km"
        private BigDecimal emissions; // kg CO2e
    }
}
