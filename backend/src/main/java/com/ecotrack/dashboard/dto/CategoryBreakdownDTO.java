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
public class CategoryBreakdownDTO {
    private String categoryName;
    private BigDecimal emission;
    private BigDecimal percentage;
}
