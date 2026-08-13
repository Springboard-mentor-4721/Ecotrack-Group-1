package com.ecotrack.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalSummaryDTO {
    private long activeGoals;
    private long completedGoals;
    private long expiredGoals;
    private double completionPercentage;
    private List<com.ecotrack.goal.dto.GoalResponse> activeGoalsList;
}
