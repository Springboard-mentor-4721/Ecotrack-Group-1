package com.ecotrack.goal.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GoalAnalyticsResponse {
    private long totalGoals;
    private long completedGoals;
    private long activeGoals;
    private long expiredGoals;
    private double completionPercentage;
}
