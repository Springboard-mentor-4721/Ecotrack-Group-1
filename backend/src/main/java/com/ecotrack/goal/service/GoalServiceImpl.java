package com.ecotrack.goal.service;

import com.ecotrack.goal.dto.GoalAnalyticsResponse;
import com.ecotrack.goal.dto.GoalProgressRequest;
import com.ecotrack.goal.dto.GoalProgressResponse;
import com.ecotrack.goal.dto.GoalRequest;
import com.ecotrack.goal.dto.GoalResponse;
import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.entity.GoalProgress;
import com.ecotrack.goal.entity.enums.GoalStatus;
import com.ecotrack.goal.entity.enums.GoalType;
import com.ecotrack.goal.exception.GoalNotFoundException;
import com.ecotrack.goal.exception.InvalidGoalOperationException;
import com.ecotrack.goal.exception.MaxActiveGoalsExceededException;
import com.ecotrack.goal.mapper.GoalMapper;
import com.ecotrack.goal.repository.GoalProgressRepository;
import com.ecotrack.goal.repository.GoalRepository;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
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
    private final CarbonProgressService carbonProgressService;

    private GoalResponse enrichDto(Goal goal) {
        GoalResponse dto = goalMapper.toDto(goal);
        dto.setAutomatic(goal.getGoalType().isAutomatic());
        
        if (goal.getGoalType().isAutomatic()) {
            dto.setCurrentValue(carbonProgressService.calculateDynamicProgress(goal));
        } else {
            BigDecimal totalProgress = goalProgressRepository.findByGoalIdOrderByRecordedAtDesc(goal.getId())
                    .stream()
                    .map(GoalProgress::getProgressValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setCurrentValue(totalProgress);
        }
        return dto;
    }

    @Override
    @Transactional
    public GoalResponse createGoal(Long userId, GoalRequest request) {
        log.info("Creating goal for user: {}", userId);

        long activeCount = goalRepository.countByUserIdAndStatus(userId, GoalStatus.ACTIVE);
        if (activeCount >= 10) {
            throw new MaxActiveGoalsExceededException("User already has the maximum of 10 active goals.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        Goal goal = goalMapper.toEntity(request);
        goal.setUser(user);
        goal.setStatus(GoalStatus.ACTIVE);

        Goal savedGoal = goalRepository.save(goal);
        return enrichDto(savedGoal);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(Long userId, Long goalId, GoalRequest request) {
        log.info("Updating goal: {} for user: {}", goalId, userId);

        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Goal not found or does not belong to user"));

        if (goal.getStatus() != GoalStatus.ACTIVE) {
            throw new InvalidGoalOperationException("Cannot update a goal that is not ACTIVE.");
        }

        goal.setGoalType(request.getGoalType());
        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setTargetValue(request.getTargetValue());
        goal.setUnit(request.getUnit());
        goal.setTargetDate(request.getTargetDate());

        Goal updatedGoal = goalRepository.save(goal);
        return enrichDto(updatedGoal);
    }

    @Override
    @Transactional(readOnly = true)
    public GoalResponse getGoal(Long userId, Long goalId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Goal not found or does not belong to user"));
        return enrichDto(goal);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GoalResponse> getUserGoals(Long userId, Pageable pageable) {
        Page<Goal> goalsPage = goalRepository.findByUserId(userId, pageable);
        return mapToGoalResponsePage(goalsPage);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GoalResponse> getUserGoalsByStatus(Long userId, GoalStatus status, Pageable pageable) {
        Page<Goal> goalsPage = goalRepository.findByUserIdAndStatus(userId, status, pageable);
        return mapToGoalResponsePage(goalsPage);
    }

    private Page<GoalResponse> mapToGoalResponsePage(Page<Goal> goalsPage) {
        List<Goal> allGoals = goalsPage.getContent();
        if (allGoals.isEmpty()) {
            return goalsPage.map(goalMapper::toDto);
        }

        // 1. Bulk GoalProgress for Manual Goals
        List<Long> manualGoalIds = allGoals.stream()
                .filter(g -> !g.getGoalType().isAutomatic())
                .map(Goal::getId)
                .collect(Collectors.toList());
                
        java.util.Map<Long, BigDecimal> manualProgressMap = new java.util.HashMap<>();
        if (!manualGoalIds.isEmpty()) {
            manualProgressMap = goalProgressRepository.sumProgressByGoalIds(manualGoalIds)
                    .stream()
                    .collect(Collectors.toMap(
                            com.ecotrack.goal.repository.projection.GoalProgressBulkProjection::getGoalId, 
                            com.ecotrack.goal.repository.projection.GoalProgressBulkProjection::getTotalProgress,
                            (a, b) -> a)); // in case of duplicates (should not happen due to GROUP BY)
        }

        // 2. Bulk Carbon Aggregation for Automatic Goals
        List<Goal> autoGoals = allGoals.stream()
                .filter(g -> g.getGoalType().isAutomatic())
                .collect(Collectors.toList());
                
        java.util.Map<Long, BigDecimal> autoProgressMap = new java.util.HashMap<>();
        if (!autoGoals.isEmpty()) {
            autoProgressMap = carbonProgressService.calculateBulkDynamicProgress(autoGoals);
        }

        final java.util.Map<Long, BigDecimal> finalManualProgressMap = manualProgressMap;
        final java.util.Map<Long, BigDecimal> finalAutoProgressMap = autoProgressMap;

        return goalsPage.map(goal -> enrichDtoWithMaps(goal, finalManualProgressMap, finalAutoProgressMap));
    }

    private GoalResponse enrichDtoWithMaps(Goal goal, java.util.Map<Long, BigDecimal> manualProgressMap, java.util.Map<Long, BigDecimal> autoProgressMap) {
        GoalResponse dto = goalMapper.toDto(goal);
        dto.setAutomatic(goal.getGoalType().isAutomatic());
        
        if (goal.getGoalType().isAutomatic()) {
            dto.setCurrentValue(autoProgressMap.getOrDefault(goal.getId(), BigDecimal.ZERO));
        } else {
            dto.setCurrentValue(manualProgressMap.getOrDefault(goal.getId(), BigDecimal.ZERO));
        }
        return dto;
    }

    @Override
    @Transactional
    public void deleteGoal(Long userId, Long goalId) {
        log.info("Deleting goal: {} for user: {}", goalId, userId);
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Goal not found or does not belong to user"));
        goalRepository.delete(goal);
    }

    @Override
    @Transactional
    public GoalProgressResponse recordProgress(Long userId, Long goalId, GoalProgressRequest request) {
        log.info("Recording progress for goal: {} by user: {}", goalId, userId);

        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Goal not found or does not belong to user"));

        if (goal.getGoalType().isAutomatic()) {
            throw new InvalidGoalOperationException("This goal is automatically tracked and cannot be updated manually.");
        }

        if (goal.getStatus() == GoalStatus.ACHIEVED ||
            goal.getStatus() == GoalStatus.EXPIRED ||
            goal.getStatus() == GoalStatus.ABANDONED) {
            throw new InvalidGoalOperationException("Cannot record progress on a goal with status: " + goal.getStatus());
        }

        GoalProgress progress = goalMapper.toEntity(request);
        progress.setGoal(goal);

        GoalProgress savedProgress = goalProgressRepository.save(progress);

        // Check cumulative progress
        List<GoalProgress> allProgress = goalProgressRepository.findByGoalIdOrderByRecordedAtDesc(goalId);
        BigDecimal totalProgress = allProgress.stream()
                .map(GoalProgress::getProgressValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalProgress.compareTo(goal.getTargetValue()) >= 0) {
            log.info("Goal {} target reached! Transitioning to ACHIEVED.", goalId);
            goal.setStatus(GoalStatus.ACHIEVED);
            goalRepository.save(goal);
        }

        return goalMapper.toDto(savedProgress);
    }

    @Override
    @Transactional(readOnly = true)
    public GoalAnalyticsResponse getGoalAnalytics(Long userId, Long goalId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new GoalNotFoundException("Goal not found or does not belong to user"));

        List<com.ecotrack.goal.dto.GoalHistoryItem> unifiedHistory;
        BigDecimal totalProgress = BigDecimal.ZERO;

        if (goal.getGoalType().isAutomatic()) {
            unifiedHistory = carbonProgressService.getAutomaticGoalHistory(goal);
            if (!unifiedHistory.isEmpty()) {
                totalProgress = unifiedHistory.get(0).getCurrentProgress();
            }
        } else {
            List<GoalProgress> history = goalProgressRepository.findByGoalIdOrderByRecordedAtDesc(goalId);
            
            // For manual, we need to calculate running total going forward, then reverse
            List<GoalProgress> forwardHistory = new java.util.ArrayList<>(history);
            java.util.Collections.reverse(forwardHistory);
            
            unifiedHistory = new java.util.ArrayList<>();
            BigDecimal runningTotal = BigDecimal.ZERO;
            
            for (GoalProgress progress : forwardHistory) {
                runningTotal = runningTotal.add(progress.getProgressValue());
                unifiedHistory.add(com.ecotrack.goal.dto.GoalHistoryItem.builder()
                        .type("MANUAL")
                        .timestamp(progress.getRecordedAt())
                        .title("Manual Progress Update")
                        .description(progress.getNotes() != null && !progress.getNotes().isBlank() ? progress.getNotes() : "Manual progress logged by user")
                        .source("User Input")
                        .progressChange(progress.getProgressValue())
                        .currentProgress(runningTotal)
                        .build());
            }
            java.util.Collections.reverse(unifiedHistory);
            totalProgress = runningTotal;
        }

        double percentage = 0.0;
        if (goal.getTargetValue().compareTo(BigDecimal.ZERO) > 0) {
            percentage = totalProgress.divide(goal.getTargetValue(), 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        }
        
        // Cap at 100%
        if (percentage > 100.0) {
            percentage = 100.0;
        }

        LocalDate projectedCompletionDate = null;
        if (unifiedHistory.size() > 0 && percentage > 0 && percentage < 100) {
            // Simple projection based on average daily progress
            LocalDate startDate = goal.getCreatedAt().toLocalDate();
            LocalDate lastRecordDate = unifiedHistory.get(0).getTimestamp().toLocalDate();
            long daysElapsed = ChronoUnit.DAYS.between(startDate, lastRecordDate);
            if (daysElapsed <= 0) daysElapsed = 1; // prevent division by zero

            BigDecimal avgProgressPerDay = totalProgress.divide(BigDecimal.valueOf(daysElapsed), 4, RoundingMode.HALF_UP);
            if (avgProgressPerDay.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal remaining = goal.getTargetValue().subtract(totalProgress);
                int daysRemaining = remaining.divide(avgProgressPerDay, 0, RoundingMode.UP).intValue();
                projectedCompletionDate = lastRecordDate.plusDays(daysRemaining);
            }
        } else if (percentage >= 100.0) {
            projectedCompletionDate = LocalDate.now(); // already done
        }

        return GoalAnalyticsResponse.builder()
                .progressPercentage(percentage)
                .projectedCompletionDate(projectedCompletionDate)
                .history(unifiedHistory)
                .build();
    }


}
