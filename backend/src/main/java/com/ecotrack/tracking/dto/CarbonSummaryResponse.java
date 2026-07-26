package com.ecotrack.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonSummaryResponse {
    private BigDecimal totalEmission;
    private long totalEntriesCount;
    private List<CategoryEmissionResponse> categorySummaries;
    private List<DailyEmissionResponse> weeklyTrend;
}
