package com.ecotrack.tracking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCarbonEntryRequest {

    @NotNull(message = "Subcategory ID is required")
    private Long subCategoryId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @NotNull(message = "Entry date is required")
    @PastOrPresent(message = "Entry date cannot be in the future")
    private LocalDateTime entryDate;

    @Size(max = 500, message = "Notes must be less than 500 characters")
    private String notes;
}
