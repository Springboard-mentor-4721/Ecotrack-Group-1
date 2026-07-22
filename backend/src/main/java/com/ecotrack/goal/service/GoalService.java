package com.ecotrack.goal.service;

import com.ecotrack.goal.dto.GoalAnalyticsResponse;
import com.ecotrack.goal.dto.GoalProgressRequest;
import com.ecotrack.goal.dto.GoalProgressResponse;
import com.ecotrack.goal.dto.GoalRequest;
import com.ecotrack.goal.dto.GoalResponse;
import com.ecotrack.goal.entity.enums.GoalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GoalService {

    GoalResponse createGoal(Long userId, GoalRequest request);

    GoalResponse updateGoal(Long userId, Long goalId, GoalRequest request);

    GoalResponse getGoal(Long userId, Long goalId);

    Page<GoalResponse> getUserGoals(Long userId, Pageable pageable);

    Page<GoalResponse> getUserGoalsByStatus(Long userId, GoalStatus status, Pageable pageable);

    void deleteGoal(Long userId, Long goalId);

    GoalProgressResponse recordProgress(Long userId, Long goalId, GoalProgressRequest request);

    GoalAnalyticsResponse getGoalAnalytics(Long userId, Long goalId);
}
