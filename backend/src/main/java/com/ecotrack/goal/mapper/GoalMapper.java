package com.ecotrack.goal.mapper;

import com.ecotrack.goal.dto.GoalProgressResponse;
import com.ecotrack.goal.dto.GoalResponse;
import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.entity.GoalProgress;
import org.springframework.stereotype.Component;

@Component
public class GoalMapper {

    public GoalResponse toGoalResponse(Goal goal) {
        if (goal == null) {
            return null;
        }

        return GoalResponse.builder()
                .id(goal.getId())
                .userId(goal.getUser() != null ? goal.getUser().getId() : null)
                .title(goal.getTitle())
                .description(goal.getDescription())
                .targetValue(goal.getTargetValue())
                .currentValue(goal.getCurrentValue())
                .unit(goal.getUnit())
                .targetDate(goal.getTargetDate())
                .status(goal.getStatus())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }

    public GoalProgressResponse toGoalProgressResponse(GoalProgress progress) {
        if (progress == null) {
            return null;
        }

        return GoalProgressResponse.builder()
                .id(progress.getId())
                .goalId(progress.getGoal() != null ? progress.getGoal().getId() : null)
                .progressValue(progress.getProgressValue())
                .notes(progress.getNotes())
                .createdAt(progress.getCreatedAt())
                .build();
    }
}
