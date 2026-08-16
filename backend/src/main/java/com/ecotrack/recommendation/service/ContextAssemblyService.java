package com.ecotrack.recommendation.service;

import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.entity.GoalProgress;
import com.ecotrack.goal.entity.enums.GoalStatus;
import com.ecotrack.goal.repository.GoalRepository;
import com.ecotrack.recommendation.dto.UserContextDTO;
import com.ecotrack.tracking.repository.CarbonEntryRepository;
import com.ecotrack.user.repository.UserProfileRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContextAssemblyService {

    private final CarbonEntryRepository carbonEntryRepository;
    private final GoalRepository goalRepository;
    private final UserProfileRepository userProfileRepository;

    public ContextAssemblyService(CarbonEntryRepository carbonEntryRepository, GoalRepository goalRepository, UserProfileRepository userProfileRepository) {
        this.carbonEntryRepository = carbonEntryRepository;
        this.goalRepository = goalRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public UserContextDTO assembleContext(Long userId, List<String> previousRecommendations) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        List<Goal> activeGoals = goalRepository.findByUserIdAndStatus(userId, GoalStatus.ACTIVE, PageRequest.of(0, 10)).getContent();
        
        List<com.ecotrack.recommendation.dto.CategorySummaryProjection> rawSummaries = carbonEntryRepository.getCategorySummaries(userId, thirtyDaysAgo);
        List<UserContextDTO.CategorySummaryDTO> categorySummaries = rawSummaries.stream()
                .map(p -> new UserContextDTO.CategorySummaryDTO(
                        p.getCategoryCode(),
                        p.getTotalVolume() != null ? p.getTotalVolume().doubleValue() : 0.0,
                        p.getEntryCount() != null ? p.getEntryCount().longValue() : 0L
                ))
                .collect(Collectors.toList());

        List<UserContextDTO.GoalSummaryDTO> goals = new ArrayList<>();
        for (Goal goal : activeGoals) {
            BigDecimal progress = goal.getProgressRecords().stream()
                    .map(GoalProgress::getProgressValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            goals.add(new UserContextDTO.GoalSummaryDTO(
                    goal.getTitle(),
                    goal.getGoalType().name(),
                    goal.getTargetValue().doubleValue(),
                    progress.doubleValue(),
                    goal.getStatus().name()
            ));
        }

        List<String> lifestyleConstraints = new ArrayList<>();
        userProfileRepository.findByUser_Id(userId).ifPresent(profile -> {
            if (profile.getLifestylePreferences() != null && !profile.getLifestylePreferences().isBlank()) {
                lifestyleConstraints.add(profile.getLifestylePreferences());
            }
        });

        return UserContextDTO.builder()
                .userId(userId)
                .categorySummaries(categorySummaries)
                .goals(goals)
                .lifestyleConstraints(lifestyleConstraints)
                .previousRecommendations(previousRecommendations)
                .eligibleTargets(new ArrayList<>()) // Deprecated
                .build();
    }
}
