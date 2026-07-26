package com.ecotrack.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonEntryResponse {
    private Long id;
    private Long subCategoryId;
    private Long categoryId;
    private String categoryName;
    private String subType;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal emissionKgco2e;
    private LocalDateTime entryDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
