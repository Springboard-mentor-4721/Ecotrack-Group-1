package com.ecotrack.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonEntryResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String subType;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal emissionKgco2e;
    private LocalDate entryDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
