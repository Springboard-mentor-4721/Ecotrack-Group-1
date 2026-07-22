package com.ecotrack.goal.service;

import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.entity.enums.GoalType;
import com.ecotrack.tracking.entity.CarbonCategory;
import com.ecotrack.tracking.repository.CarbonCategoryRepository;
import com.ecotrack.tracking.repository.CarbonEntryRepository;
import com.ecotrack.tracking.repository.projection.CategoryEmissionProjection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarbonProgressService {

    private final CarbonEntryRepository carbonEntryRepository;
    private final CarbonCategoryRepository carbonCategoryRepository;

    // Fixed ID values based on database seed
    private static final Long CATEGORY_ID_TRANSPORTATION = 1L;
    private static final Long CATEGORY_ID_ELECTRICITY = 2L;
    private static final Long CATEGORY_ID_WATER = 6L;

    @Transactional(readOnly = true)
    public BigDecimal calculateDynamicProgress(Goal goal) {
        if (goal == null || goal.getUser() == null || !goal.getGoalType().isAutomatic()) {
            return BigDecimal.ZERO;
        }

        Long userId = goal.getUser().getId();
        LocalDateTime startDate = goal.getCreatedAt().toLocalDate().atStartOfDay();
        LocalDateTime endDate = goal.getTargetDate().atTime(23, 59, 59);
        GoalType type = goal.getGoalType();

        if (type == GoalType.REDUCE_CARBON_EMISSIONS) {
            return calculateTotalEmissions(userId, startDate, endDate);
        } else if (type == GoalType.REDUCE_WATER_USAGE) {
            return calculateCategoryEmissionsById(userId, CATEGORY_ID_WATER, startDate, endDate, true);
        } else if (type == GoalType.REDUCE_ELECTRICITY_CONSUMPTION) {
            return calculateCategoryEmissionsById(userId, CATEGORY_ID_ELECTRICITY, startDate, endDate, true);
        } else if (type == GoalType.USE_PUBLIC_TRANSPORT) {
            return calculateCategoryEmissionsById(userId, CATEGORY_ID_TRANSPORTATION, startDate, endDate, true);
        } else if (type == GoalType.INCREASE_RECYCLING || type == GoalType.REDUCE_PLASTIC_USAGE) {
            return calculateCategoryEmissionsById(userId, 5L, startDate, endDate, true); // Waste category
        }
        
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateTotalEmissions(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        List<CategoryEmissionProjection> projections = carbonEntryRepository.getEmissionSummaryByUserAndDateRange(userId, startDate, endDate);
        return projections.stream()
                .map(CategoryEmissionProjection::getTotalEmission)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateCategoryEmissionsById(Long userId, Long categoryId, LocalDateTime startDate, LocalDateTime endDate, boolean useQuantity) {
        List<com.ecotrack.tracking.entity.CarbonEntry> entries = carbonEntryRepository.findAllWithCategoriesByUserIdAndDateRange(userId, startDate, endDate);
        return entries.stream()
                .filter(e -> e.getSubCategory().getCategory().getCategoryId().equals(categoryId))
                .map(e -> useQuantity ? e.getQuantity() : e.getEmissionKgco2e())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public java.util.Map<Long, BigDecimal> calculateBulkDynamicProgress(List<Goal> goals) {
        java.util.Map<Long, BigDecimal> resultMap = new java.util.HashMap<>();
        if (goals == null || goals.isEmpty()) {
            return resultMap;
        }

        Long userId = goals.get(0).getUser().getId();
        
        LocalDateTime minDate = goals.stream().map(g -> g.getCreatedAt().toLocalDate().atStartOfDay()).min(LocalDateTime::compareTo).orElse(LocalDateTime.now());
        LocalDateTime maxDate = goals.stream().map(g -> g.getTargetDate().atTime(23, 59, 59)).max(LocalDateTime::compareTo).orElse(LocalDateTime.now());

        // One Bulk Query with fetched categories
        List<com.ecotrack.tracking.entity.CarbonEntry> allEntries = carbonEntryRepository.findAllWithCategoriesByUserIdAndDateRange(userId, minDate, maxDate);
        
        for (Goal goal : goals) {
            if (!goal.getGoalType().isAutomatic()) continue;

            LocalDateTime startDate = goal.getCreatedAt().toLocalDate().atStartOfDay();
            LocalDateTime endDate = goal.getTargetDate().atTime(23, 59, 59);
            GoalType type = goal.getGoalType();
            
            BigDecimal goalTotal = BigDecimal.ZERO;

            if (type == GoalType.REDUCE_CARBON_EMISSIONS) {
                goalTotal = allEntries.stream()
                        .filter(e -> !e.getEntryDate().isBefore(startDate) && !e.getEntryDate().isAfter(endDate))
                        .map(com.ecotrack.tracking.entity.CarbonEntry::getEmissionKgco2e)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            } else {
                Long targetCatId = null;
                if (type == GoalType.REDUCE_WATER_USAGE) targetCatId = CATEGORY_ID_WATER;
                else if (type == GoalType.REDUCE_ELECTRICITY_CONSUMPTION) targetCatId = CATEGORY_ID_ELECTRICITY;
                else if (type == GoalType.USE_PUBLIC_TRANSPORT) targetCatId = CATEGORY_ID_TRANSPORTATION;
                else if (type == GoalType.INCREASE_RECYCLING || type == GoalType.REDUCE_PLASTIC_USAGE) targetCatId = 5L;

                if (targetCatId != null) {
                    final Long finalCatId = targetCatId;
                    goalTotal = allEntries.stream()
                            .filter(e -> !e.getEntryDate().isBefore(startDate) && !e.getEntryDate().isAfter(endDate))
                            .filter(e -> e.getSubCategory().getCategory().getCategoryId().equals(finalCatId))
                            .map(com.ecotrack.tracking.entity.CarbonEntry::getQuantity)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                }
            }
            resultMap.put(goal.getId(), goalTotal);
        }
        return resultMap;
    }

    @Transactional(readOnly = true)
    public List<com.ecotrack.goal.dto.GoalHistoryItem> getAutomaticGoalHistory(Goal goal) {
        if (goal == null || goal.getUser() == null || !goal.getGoalType().isAutomatic()) {
            return java.util.Collections.emptyList();
        }

        Long userId = goal.getUser().getId();
        LocalDateTime startDate = goal.getCreatedAt().toLocalDate().atStartOfDay();
        LocalDateTime endDate = goal.getTargetDate().atTime(23, 59, 59);
        GoalType type = goal.getGoalType();

        List<com.ecotrack.tracking.entity.CarbonEntry> allEntries = carbonEntryRepository.findAllWithCategoriesByUserIdAndDateRange(userId, startDate, endDate);
        
        java.util.stream.Stream<com.ecotrack.tracking.entity.CarbonEntry> filteredStream = allEntries.stream();

        if (type != GoalType.REDUCE_CARBON_EMISSIONS) {
            Long targetCatId = null;
            if (type == GoalType.REDUCE_WATER_USAGE) targetCatId = CATEGORY_ID_WATER;
            else if (type == GoalType.REDUCE_ELECTRICITY_CONSUMPTION) targetCatId = CATEGORY_ID_ELECTRICITY;
            else if (type == GoalType.USE_PUBLIC_TRANSPORT) targetCatId = CATEGORY_ID_TRANSPORTATION;
            else if (type == GoalType.INCREASE_RECYCLING || type == GoalType.REDUCE_PLASTIC_USAGE) targetCatId = 5L;

            if (targetCatId != null) {
                final Long finalCatId = targetCatId;
                filteredStream = filteredStream.filter(e -> e.getSubCategory().getCategory().getCategoryId().equals(finalCatId));
            } else {
                return java.util.Collections.emptyList();
            }
        }

        List<com.ecotrack.tracking.entity.CarbonEntry> filteredEntries = filteredStream
                .sorted(java.util.Comparator.comparing(com.ecotrack.tracking.entity.CarbonEntry::getEntryDate))
                .collect(java.util.stream.Collectors.toList());

        List<com.ecotrack.goal.dto.GoalHistoryItem> history = new java.util.ArrayList<>();
        BigDecimal runningTotal = BigDecimal.ZERO;
        
        for (com.ecotrack.tracking.entity.CarbonEntry entry : filteredEntries) {
            BigDecimal contribution = type == GoalType.REDUCE_CARBON_EMISSIONS ? entry.getEmissionKgco2e() : entry.getQuantity();
            runningTotal = runningTotal.add(contribution);
            history.add(com.ecotrack.goal.dto.GoalHistoryItem.builder()
                    .type("AUTOMATIC")
                    .timestamp(entry.getEntryDate())
                    .title("Logged " + entry.getSubCategory().getName())
                    .description(entry.getNotes() != null && !entry.getNotes().isBlank() ? entry.getNotes() : "Automatic entry from Carbon Tracker")
                    .source("Carbon Tracker")
                    .progressChange(contribution)
                    .currentProgress(runningTotal)
                    .build());
        }

        java.util.Collections.reverse(history);
        return history;
    }
}
