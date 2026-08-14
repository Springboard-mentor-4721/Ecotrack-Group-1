package com.ecotrack.goal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalOptimizationResponse {
    private String feasibility;
    private BigDecimal suggestedTarget;
    private String explanation;
}
