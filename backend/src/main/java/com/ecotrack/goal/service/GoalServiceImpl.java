package com.ecotrack.goal.service;

import com.ecotrack.goal.dto.GoalAnalyticsResponse;
import com.ecotrack.goal.dto.GoalProgressRequest;
import com.ecotrack.goal.dto.GoalProgressResponse;
import com.ecotrack.goal.dto.GoalRequest;
import com.ecotrack.goal.dto.GoalResponse;
import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.entity.GoalProgress;
import com.ecotrack.goal.enums.GoalStatus;
import com.ecotrack.goal.exception.GoalNotFoundException;
import com.ecotrack.goal.exception.InvalidGoalException;
import com.ecotrack.goal.exception.MaxActiveGoalsReachedException;
import com.ecotrack.goal.mapper.GoalMapper;
import com.ecotrack.goal.repository.GoalProgressRepository;
import com.ecotrack.goal.repository.GoalRepository;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final GoalProgressRepository goalProgressRepository;
    private final UserRepository userRepository;
    private final GoalMapper goalMapper;

    private static final int MAX_ACTIVE_GOALS = 5;

    @Override
    @Transactional
    public GoalResponse createGoal(Long userId, GoalRequest request) {
        log.info("Creating goal for user ID: {}", userId);



        long activeGoalsCount = goalRepository.countByUserIdAndStatus(userId, GoalStatus.ACTIVE);
        if (activeGoalsCount >= MAX_ACTIVE_GOALS) {
            throw new MaxActiveGoalsReachedException("Maximum of " + MAX_ACTIVE_GOALS + " active goals allowed");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Goal goal = new Goal();
        goal.setUser(user);
        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setTargetValue(request.getTargetValue());
        goal.setUnit(request.getUnit());
        goal.setTargetDate(request.getTargetDate());
        goal.setStatus(GoalStatus.ACTIVE);

        goal = goalRepository.save(goal);
        return goalMapper.toGoalResponse(goal);
    }

    @Override
    @Transactional(readOnly = true)
    public GoalResponse getGoal(Long userId, Long goalId) {
        log.info("Fetching goal ID: {} for user ID: {}", goalId, userId);
        Goal goal = getGoalAndVerifyOwnership(userId, goalId);
        return goalMapper.toGoalResponse(goal);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GoalResponse> getAllGoals(Long userId, Pageable pageable) {
        log.info("Fetching all goals for user ID: {}", userId);
        return goalRepository.findByUserId(userId, pageable)
                .map(goalMapper::toGoalResponse);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(Long userId, Long goalId, GoalRequest request) {
        log.info("Updating goal ID: {} for user ID: {}", goalId, userId);
        Goal goal = getGoalAndVerifyOwnership(userId, goalId);

        if (goal.getStatus() != GoalStatus.ACTIVE) {
            throw new InvalidGoalException("Only active goals can be updated");
        }



        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setTargetValue(request.getTargetValue());
        goal.setUnit(request.getUnit());
        goal.setTargetDate(request.getTargetDate());

        goal = goalRepository.save(goal);
        return goalMapper.toGoalResponse(goal);
    }

    @Override
    @Transactional
    public void deleteGoal(Long userId, Long goalId) {
        log.info("Deleting goal ID: {} for user ID: {}", goalId, userId);
        Goal goal = getGoalAndVerifyOwnership(userId, goalId);
        goalRepository.delete(goal);
    }

    @Override
    @Transactional
    public GoalProgressResponse addProgress(Long userId, Long goalId, GoalProgressRequest request) {
        log.info("Adding progress for goal ID: {} for user ID: {}", goalId, userId);
        Goal goal = getGoalAndVerifyOwnership(userId, goalId);

        if (goal.getStatus() != GoalStatus.ACTIVE) {
            throw new InvalidGoalException("Cannot add progress to a non-active goal");
        }

        GoalProgress progress = new GoalProgress();
        progress.setGoal(goal);
        progress.setProgressValue(request.getProgressValue());
        progress.setNotes(request.getNotes());
        
        progress = goalProgressRepository.save(progress);

        double newCurrentValue = goal.getCurrentValue() + request.getProgressValue();
        goal.setCurrentValue(newCurrentValue);

        if (goal.getCurrentValue() >= goal.getTargetValue()) {
            goal.setCurrentValue(goal.getTargetValue()); // Cap at target
            goal.setStatus(GoalStatus.COMPLETED);
        }

        goalRepository.save(goal);

        return goalMapper.toGoalProgressResponse(progress);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalProgressResponse> getGoalProgress(Long userId, Long goalId) {
        log.info("Fetching progress for goal ID: {} for user ID: {}", goalId, userId);
        getGoalAndVerifyOwnership(userId, goalId); // Ensure user owns the goal

        return goalProgressRepository.findByGoalId(goalId).stream()
                .map(goalMapper::toGoalProgressResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GoalAnalyticsResponse getAnalytics(Long userId) {
        log.info("Generating analytics for user ID: {}", userId);
        List<Goal> goals = goalRepository.findByUserId(userId);

        long totalGoals = goals.size();
        long completedGoals = goals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();
        long activeGoals = goals.stream().filter(g -> g.getStatus() == GoalStatus.ACTIVE).count();
        long expiredGoals = goals.stream().filter(g -> g.getStatus() == GoalStatus.EXPIRED).count();

        double completionPercentage = totalGoals > 0 ? (double) completedGoals / totalGoals * 100 : 0.0;

        return GoalAnalyticsResponse.builder()
                .totalGoals(totalGoals)
                .completedGoals(completedGoals)
                .activeGoals(activeGoals)
                .expiredGoals(expiredGoals)
                .completionPercentage(completionPercentage)
                .build();
    }

    private Goal getGoalAndVerifyOwnership(Long userId, Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new GoalNotFoundException("Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new GoalNotFoundException("Goal not found");
        }

        return goal;
    }
}
