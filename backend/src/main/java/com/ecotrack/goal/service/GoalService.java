package com.ecotrack.goal.service;

import com.ecotrack.goal.dto.GoalAnalyticsResponse;
import com.ecotrack.goal.dto.GoalProgressRequest;
import com.ecotrack.goal.dto.GoalProgressResponse;
import com.ecotrack.goal.dto.GoalRequest;
import com.ecotrack.goal.dto.GoalResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface GoalService {
    GoalResponse createGoal(Long userId, GoalRequest request);
    GoalResponse getGoal(Long userId, Long goalId);
    Page<GoalResponse> getAllGoals(Long userId, Pageable pageable);
    GoalResponse updateGoal(Long userId, Long goalId, GoalRequest request);
    void deleteGoal(Long userId, Long goalId);
    GoalProgressResponse addProgress(Long userId, Long goalId, GoalProgressRequest request);
    List<GoalProgressResponse> getGoalProgress(Long userId, Long goalId);
    GoalAnalyticsResponse getAnalytics(Long userId);
}
