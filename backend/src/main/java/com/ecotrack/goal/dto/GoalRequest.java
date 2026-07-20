package com.ecotrack.goal.dto;

import com.ecotrack.goal.entity.enums.GoalType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalRequest {

    @NotNull
    private GoalType goalType;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    @Positive
    private BigDecimal targetValue;

    @NotBlank
    private String unit;

    @NotNull
    @Future
    private LocalDate targetDate;
}
