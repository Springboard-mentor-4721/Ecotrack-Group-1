package com.ecotrack.goal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalAnalyticsResponse {
    
    private double progressPercentage; // Capped at 100%
    private LocalDate projectedCompletionDate;
    private List<GoalHistoryItem> history;
}
