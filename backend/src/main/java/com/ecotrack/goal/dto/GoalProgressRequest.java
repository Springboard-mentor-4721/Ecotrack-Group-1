package com.ecotrack.goal.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GoalProgressRequest {

    @NotNull(message = "Progress value is required")
    @Positive(message = "Progress value must be positive")
    private Double progressValue;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}
