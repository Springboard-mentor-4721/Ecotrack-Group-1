package com.ecotrack.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarbonEntryUpdatedEvent {
    private Long userId;
    private Long entryId;
    private Long oldCategoryId;
    private Long oldSubCategoryId;
    private Long newCategoryId;
    private Long newSubCategoryId;
    private BigDecimal oldAmount;
    private BigDecimal oldCarbonEmission;
    private BigDecimal newAmount;
    private BigDecimal newCarbonEmission;
}
