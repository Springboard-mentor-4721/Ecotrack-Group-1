package com.ecotrack.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarbonEntryDeletedEvent {
    private Long userId;
    private Long entryId;
    private Long categoryId;
    private Long subCategoryId;
    private BigDecimal amount;
    private BigDecimal carbonEmission;
}
