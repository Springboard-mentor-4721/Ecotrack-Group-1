package com.ecotrack.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private BigDecimal totalEmission;
    private BigDecimal monthlyEmission;
    private BigDecimal previousMonthEmission;
    private BigDecimal weeklyEmission;
    private Long totalEntries;
    private Long weeklyEntries;
}
