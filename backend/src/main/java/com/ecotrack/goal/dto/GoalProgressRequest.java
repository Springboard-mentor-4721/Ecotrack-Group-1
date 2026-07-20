package com.ecotrack.goal.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalProgressRequest {

    @NotNull
    @PositiveOrZero
    private BigDecimal progressValue;

    @Size(max = 500)
    private String notes;
}
