package com.ecotrack.goal.mapper;

import com.ecotrack.goal.dto.GoalProgressRequest;
import com.ecotrack.goal.dto.GoalProgressResponse;
import com.ecotrack.goal.dto.GoalRequest;
import com.ecotrack.goal.dto.GoalResponse;
import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.entity.GoalProgress;
import org.springframework.stereotype.Component;

@Component
public class GoalMapper {

    public Goal toEntity(GoalRequest request) {
        if (request == null) {
            return null;
        }

        return Goal.builder()
                .goalType(request.getGoalType())
                .title(request.getTitle())
                .description(request.getDescription())
                .targetValue(request.getTargetValue())
                .unit(request.getUnit())
                .targetDate(request.getTargetDate())
                .build();
    }

    public GoalResponse toDto(Goal goal) {
        if (goal == null) {
            return null;
        }

        return GoalResponse.builder()
                .id(goal.getId())
                .goalType(goal.getGoalType())
                .title(goal.getTitle())
                .description(goal.getDescription())
                .targetValue(goal.getTargetValue())
                .unit(goal.getUnit())
                .targetDate(goal.getTargetDate())
                .status(goal.getStatus())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }

    public GoalProgress toEntity(GoalProgressRequest request) {
        if (request == null) {
            return null;
        }

        return GoalProgress.builder()
                .progressValue(request.getProgressValue())
                .notes(request.getNotes())
                .build();
    }

    public GoalProgressResponse toDto(GoalProgress progress) {
        if (progress == null) {
            return null;
        }

        return GoalProgressResponse.builder()
                .id(progress.getId())
                .goalId(progress.getGoal() != null ? progress.getGoal().getId() : null)
                .progressValue(progress.getProgressValue())
                .notes(progress.getNotes())
                .recordedAt(progress.getRecordedAt())
                .build();
    }
}
