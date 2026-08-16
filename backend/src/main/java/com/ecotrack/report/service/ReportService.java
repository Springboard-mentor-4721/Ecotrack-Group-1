package com.ecotrack.report.service;

import com.ecotrack.challenge.entity.ChallengeParticipant;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import com.ecotrack.gamification.entity.UserGamificationProfile;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.entity.enums.GoalStatus;
import com.ecotrack.goal.repository.GoalRepository;
import com.ecotrack.report.dto.CarbonReportDTO;
import com.ecotrack.report.dto.ChallengeReportDTO;
import com.ecotrack.report.dto.GoalReportDTO;
import com.ecotrack.report.dto.SustainabilityReportDTO;
import com.ecotrack.tracking.entity.CarbonEntry;
import com.ecotrack.tracking.repository.CarbonEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.data.domain.Pageable;

import com.ecotrack.report.dto.GoalAnalyticsDTO;

import com.ecotrack.report.dto.ChallengeAnalyticsDTO;
import com.ecotrack.report.dto.ChallengePerformancePageDTO;
import com.ecotrack.challenge.repository.projection.DailyCompletionProjection;
import com.ecotrack.challenge.repository.projection.MonthlyCompletionProjection;
import com.ecotrack.gamification.enums.XpSourceType;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;

import com.ecotrack.report.dto.GoalPerformancePageDTO;
import com.ecotrack.goal.repository.projection.DailyProgressProjection;
import com.ecotrack.goal.repository.projection.MonthlyProgressProjection;
import com.ecotrack.goal.entity.enums.GoalStatus;

import com.ecotrack.report.dto.CarbonAnalyticsDTO;
import com.ecotrack.report.dto.CarbonEntryPageDTO;
import com.ecotrack.tracking.repository.projection.CategoryEmissionProjection;
import com.ecotrack.tracking.repository.projection.DailyEmissionProjection;
import com.ecotrack.tracking.repository.projection.MonthlyEmissionProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final CarbonEntryRepository carbonEntryRepository;
    private final GoalRepository goalRepository;
    private final com.ecotrack.goal.repository.GoalProgressRepository goalProgressRepository;
    private final com.ecotrack.goal.service.CarbonProgressService carbonProgressService;
    private final ChallengeParticipantRepository challengeParticipantRepository;
    private final UserGamificationProfileRepository gamificationProfileRepository;
    private final com.ecotrack.gamification.repository.XpLedgerRepository xpLedgerRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");


    public CarbonAnalyticsDTO getCarbonAnalytics(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;

        // Total emissions and Categories
        List<CategoryEmissionProjection> categoryProjections = carbonEntryRepository.getEmissionSummaryByUserAndDateRange(userId, start, end);

        BigDecimal totalEmissions = BigDecimal.ZERO;
        for (CategoryEmissionProjection proj : categoryProjections) {
            totalEmissions = totalEmissions.add(proj.getTotalEmission());
        }

        // Rankings
        List<CarbonAnalyticsDTO.CarbonCategoryRankingDTO> categoryRankings = new ArrayList<>();
        if (totalEmissions.compareTo(BigDecimal.ZERO) > 0) {
            categoryProjections.sort((a, b) -> b.getTotalEmission().compareTo(a.getTotalEmission()));
            int rank = 1;
            for (CategoryEmissionProjection proj : categoryProjections) {
                BigDecimal percentage = proj.getTotalEmission().multiply(new BigDecimal("100"))
                        .divide(totalEmissions, 1, RoundingMode.HALF_UP);
                categoryRankings.add(CarbonAnalyticsDTO.CarbonCategoryRankingDTO.builder()
                        .rank(rank++)
                        .category(proj.getCategoryName())
                        .absoluteEmissions(proj.getTotalEmission())
                        .percentage(percentage)
                        .build());
            }
        }

        String highestCategory = categoryRankings.isEmpty() ? null : categoryRankings.get(0).getCategory();

        BigDecimal averagePerDay = totalEmissions.divide(BigDecimal.valueOf(days), 1, RoundingMode.HALF_UP);
        long entryCount = carbonEntryRepository.countByUserIdAndEntryDateBetween(userId, start, end);

        // Previous Period
        LocalDate prevStartDate = startDate.minusDays(days);
        LocalDate prevEndDate = startDate.minusDays(1);
        List<CategoryEmissionProjection> prevCategoryProjections = carbonEntryRepository.getEmissionSummaryByUserAndDateRange(userId, prevStartDate.atStartOfDay(), prevEndDate.atTime(LocalTime.MAX));
        BigDecimal prevTotalEmissions = BigDecimal.ZERO;
        for (CategoryEmissionProjection proj : prevCategoryProjections) {
            prevTotalEmissions = prevTotalEmissions.add(proj.getTotalEmission());
        }

        String direction;
        BigDecimal changePercentage = BigDecimal.ZERO;
        if (prevTotalEmissions.compareTo(BigDecimal.ZERO) == 0) {
            direction = "NO_PREVIOUS_DATA";
        } else {
            changePercentage = totalEmissions.subtract(prevTotalEmissions)
                    .multiply(new BigDecimal("100"))
                    .divide(prevTotalEmissions, 1, RoundingMode.HALF_UP);
            if (changePercentage.compareTo(BigDecimal.ZERO) > 0) {
                direction = "INCREASED";
            } else if (changePercentage.compareTo(BigDecimal.ZERO) < 0) {
                direction = "IMPROVED";
            } else {
                direction = "NO_CHANGE";
            }
        }

        // Trend
        List<CarbonAnalyticsDTO.CarbonTrendPointDTO> trend = new ArrayList<>();
        if (days > 60) {
            List<MonthlyEmissionProjection> monthly = carbonEntryRepository.getMonthlyEmissionSummary(userId, start, end);
            for (MonthlyEmissionProjection p : monthly) {
                String monthStr = String.format("%04d-%02d", p.getYear(), p.getMonth());
                trend.add(CarbonAnalyticsDTO.CarbonTrendPointDTO.builder()
                        .date(monthStr)
                        .emission(p.getTotalEmission())
                        .build());
            }
        } else {
            List<DailyEmissionProjection> daily = carbonEntryRepository.getDailyEmissionSummary(userId, start, end);
            for (DailyEmissionProjection p : daily) {
                trend.add(CarbonAnalyticsDTO.CarbonTrendPointDTO.builder()
                        .date(p.getDate().toString())
                        .emission(p.getTotalEmission())
                        .build());
            }
        }

        // Insights
        List<String> insights = new ArrayList<>();
        if (highestCategory != null) {
            insights.add(highestCategory + " is your largest emission category.");
        }
        if ("IMPROVED".equals(direction)) {
            insights.add("Your emissions decreased " + changePercentage.abs() + "% compared with the previous period.");
        } else if ("INCREASED".equals(direction)) {
            insights.add("Your emissions increased " + changePercentage.abs() + "% compared with the previous period.");
        }

        return CarbonAnalyticsDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalEmissions(totalEmissions)
                .averagePerDay(averagePerDay)
                .highestCategory(highestCategory)
                .entryCount(entryCount)
                .previousPeriodTotal(prevTotalEmissions)
                .changePercentage(changePercentage.abs())
                .direction(direction)
                .trend(trend)
                .categoryRankings(categoryRankings)
                .insights(insights)
                .build();
    }

    public CarbonEntryPageDTO getCarbonEntries(Long userId, LocalDate startDate, LocalDate endDate, int page, int size) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        Page<CarbonEntry> entryPage = carbonEntryRepository.findByUserIdAndEntryDateBetween(userId, start, end, PageRequest.of(page, size, org.springframework.data.domain.Sort.by("entryDate").descending()));

        List<com.ecotrack.report.dto.CarbonEntryPageDTO.CarbonEntryDTO> dtos = entryPage.getContent().stream()
                .map(e -> com.ecotrack.report.dto.CarbonEntryPageDTO.CarbonEntryDTO.builder()
                        .date(e.getEntryDate().format(DATE_FORMATTER))
                        .activity(e.getNotes() != null && !e.getNotes().isEmpty() ? e.getNotes() : e.getSubCategory().getName())
                        .category(e.getSubCategory().getCategory().getName())
                        .amount(e.getQuantity() + " " + e.getSubCategory().getDefaultUnit())
                        .emissions(e.getEmissionKgco2e())
                        .build())
                .collect(Collectors.toList());

        return CarbonEntryPageDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .entries(dtos)
                .currentPage(entryPage.getNumber())
                .totalPages(entryPage.getTotalPages())
                .totalElements(entryPage.getTotalElements())
                .hasNext(entryPage.hasNext())
                .build();
    }

    public CarbonReportDTO getCarbonReport(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<CarbonEntry> entries = carbonEntryRepository.findAllWithCategoriesByUserIdAndDateRange(userId, start, end);

        BigDecimal totalEmissions = entries.stream()
                .map(CarbonEntry::getEmissionKgco2e)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> emissionsByCategory = new HashMap<>();
        for (CarbonEntry entry : entries) {
            String category = entry.getSubCategory().getCategory().getName();
            emissionsByCategory.merge(category, entry.getEmissionKgco2e(), BigDecimal::add);
        }

        List<CarbonReportDTO.CarbonEntryDetail> details = entries.stream()
                .map(e -> CarbonReportDTO.CarbonEntryDetail.builder()
                        .date(e.getEntryDate().format(DATE_FORMATTER))
                        .category(e.getSubCategory().getCategory().getName())
                        .subCategory(e.getSubCategory().getName())
                        .emission(e.getEmissionKgco2e())
                        .description(e.getNotes() != null ? e.getNotes() : "")
                        .build())
                .collect(Collectors.toList());

        return CarbonReportDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalEmissions(totalEmissions)
                .emissionsByCategory(emissionsByCategory)
                .entries(details)
                .build();
    }


    public GoalAnalyticsDTO getGoalAnalytics(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;

        long activeGoals = goalRepository.countActiveByUserIdAndDateRange(userId, startDate, end);
        long completedGoals = goalRepository.countCompletedByUserIdAndDateRange(userId, start, end);
        long totalGoals = activeGoals + completedGoals;

        Map<String, Long> statusDistribution = new HashMap<>();
        List<Goal> allGoals = goalRepository.findByUserId(userId, org.springframework.data.domain.Pageable.unpaged()).getContent();

        for (Goal g : allGoals) {
            boolean isActiveInPeriod = g.getStatus() == GoalStatus.ACTIVE && !g.getCreatedAt().toLocalDate().isAfter(endDate) && !g.getTargetDate().isBefore(startDate);
            boolean isCompletedInPeriod = g.getStatus() == GoalStatus.ACHIEVED && g.getUpdatedAt() != null && !g.getUpdatedAt().isBefore(start) && !g.getUpdatedAt().isAfter(end);
            
            if (isActiveInPeriod || isCompletedInPeriod) {
                String computedStatus = g.getStatus().name();
                
                if (g.getGoalType().isAutomatic()) {
                    BigDecimal used = carbonProgressService.calculateDynamicProgress(g);
                    BigDecimal limit = g.getTargetValue() != null ? g.getTargetValue() : BigDecimal.ZERO;
                    boolean pastEnd = g.getTargetDate().isBefore(LocalDate.now());
                    
                    if (used.compareTo(limit) >= 0) {
                        computedStatus = "EXCEEDED";
                    } else if (pastEnd && used.compareTo(limit) <= 0) {
                        computedStatus = "BUDGET_COMPLETED";
                    } else if (used.compareTo(limit.multiply(new BigDecimal("0.75"))) >= 0) {
                        computedStatus = "NEAR_LIMIT";
                    } else {
                        computedStatus = "WITHIN_BUDGET";
                    }
                }
                
                statusDistribution.put(computedStatus, statusDistribution.getOrDefault(computedStatus, 0L) + 1);
            }
        }

        BigDecimal completionRate = BigDecimal.ZERO;
        if (totalGoals > 0) {
            completionRate = BigDecimal.valueOf(completedGoals)
                    .multiply(new BigDecimal("100"))
                    .divide(BigDecimal.valueOf(totalGoals), 1, RoundingMode.HALF_UP);
        }

        BigDecimal totalProgressMade = goalProgressRepository.sumProgressByUserIdAndDateRange(userId, start, end);

        // Previous period
        LocalDate prevStartDate = startDate.minusDays(days);
        LocalDate prevEndDate = startDate.minusDays(1);
        BigDecimal prevProgress = goalProgressRepository.sumProgressByUserIdAndDateRange(userId, prevStartDate.atStartOfDay(), prevEndDate.atTime(LocalTime.MAX));

        BigDecimal progressChangePercentage = BigDecimal.ZERO;
        String progressDirection;

        if (prevProgress.compareTo(BigDecimal.ZERO) == 0) {
            progressDirection = "NO_PREVIOUS_DATA";
        } else {
            progressChangePercentage = totalProgressMade.subtract(prevProgress)
                    .multiply(new BigDecimal("100"))
                    .divide(prevProgress, 1, RoundingMode.HALF_UP);

            if (progressChangePercentage.compareTo(BigDecimal.ZERO) > 0) {
                progressDirection = "IMPROVED";
            } else if (progressChangePercentage.compareTo(BigDecimal.ZERO) < 0) {
                progressDirection = "DECREASED";
            } else {
                progressDirection = "NO_CHANGE";
            }
        }

        List<GoalAnalyticsDTO.GoalProgressTrendDTO> trend = new ArrayList<>();
        if (days > 60) {
            List<MonthlyProgressProjection> monthly = goalProgressRepository.getMonthlyProgressSummary(userId, start, end);
            for (MonthlyProgressProjection p : monthly) {
                String monthStr = String.format("%04d-%02d", p.getYear(), p.getMonth());
                trend.add(GoalAnalyticsDTO.GoalProgressTrendDTO.builder()
                        .date(monthStr)
                        .progressValue(p.getTotalProgress())
                        .build());
            }
        } else {
            List<DailyProgressProjection> daily = goalProgressRepository.getDailyProgressSummary(userId, start, end);
            for (DailyProgressProjection p : daily) {
                trend.add(GoalAnalyticsDTO.GoalProgressTrendDTO.builder()
                        .date(p.getDate().toString())
                        .progressValue(p.getTotalProgress())
                        .build());
            }
        }

        List<GoalAnalyticsDTO.GoalAttentionDTO> attention = new ArrayList<>();
        // Simple deterministic rule: active goals past target date
        List<Goal> expiredActive = goalRepository.findByTargetDateBeforeAndStatus(LocalDate.now(), GoalStatus.ACTIVE);
        for(Goal g : expiredActive) {
            if(g.getUser().getId().equals(userId)) {
                attention.add(GoalAnalyticsDTO.GoalAttentionDTO.builder()
                        .goalId(g.getId())
                        .goalName(g.getTitle())
                        .reason("Deadline passed but goal is still active")
                        .build());
            }
        }

        List<String> insights = new ArrayList<>();
        if (totalProgressMade.compareTo(BigDecimal.ZERO) == 0 && totalGoals > 0) {
            insights.add("You have goals but no progress recorded in this period.");
        } else if ("IMPROVED".equals(progressDirection)) {
            insights.add("Your goal progress increased by " + progressChangePercentage.abs() + "% compared to the previous period.");
        }

        return GoalAnalyticsDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalGoals(totalGoals)
                .activeGoals(activeGoals)
                .completedGoals(completedGoals)
                .completionRate(completionRate)
                .totalProgressMade(totalProgressMade)
                .previousPeriodProgress(prevProgress)
                .progressChangePercentage(progressChangePercentage.abs())
                .progressDirection(progressDirection)
                .statusDistribution(statusDistribution)
                .progressTrend(trend)
                .needsAttention(attention)
                .insights(insights)
                .build();
    }

    public GoalPerformancePageDTO getGoalPerformance(Long userId, LocalDate startDate, LocalDate endDate, int page, int size) {
        Page<Goal> goalsPage = goalRepository.findByUserId(userId, PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending()));

        List<GoalPerformancePageDTO.GoalPerformanceDTO> dtos = goalsPage.getContent().stream().map(g -> {
            boolean isAutomatic = g.getGoalType().isAutomatic();
            
            BigDecimal progressInPeriod = null;
            BigDecimal cumulativeProgress = null;
            BigDecimal progressPct = null;
            
            BigDecimal budgetUsedInPeriod = null;
            BigDecimal budgetCumulativeUsed = null;
            BigDecimal budgetRemaining = null;
            BigDecimal budgetUsagePercentage = null;
            
            if (isAutomatic) {
                // Determine usage using CarbonProgressService (which acts cumulatively by default over the goal's lifetime)
                // For 'InPeriod', we should arguably use a different calculation, but for now we mimic the lifetime usage
                // because budget goals apply over their whole lifetime. We can use calculateDynamicProgress to get total usage.
                
                // Let's create a temporary goal with the requested period to get the period's usage
                Goal periodGoal = new Goal();
                periodGoal.setUser(g.getUser());
                periodGoal.setGoalType(g.getGoalType());
                periodGoal.setCreatedAt(startDate.atStartOfDay());
                periodGoal.setTargetDate(endDate);
                
                budgetUsedInPeriod = carbonProgressService.calculateDynamicProgress(periodGoal);
                budgetCumulativeUsed = carbonProgressService.calculateDynamicProgress(g);
                
                budgetRemaining = g.getTargetValue().subtract(budgetCumulativeUsed);
                if (budgetRemaining.compareTo(BigDecimal.ZERO) < 0) {
                    budgetRemaining = BigDecimal.ZERO;
                }
                
                if (g.getTargetValue() != null && g.getTargetValue().compareTo(BigDecimal.ZERO) > 0) {
                    budgetUsagePercentage = budgetCumulativeUsed.divide(g.getTargetValue(), 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100));
                } else {
                    budgetUsagePercentage = BigDecimal.ZERO;
                }
            } else {
                progressInPeriod = goalProgressRepository.sumProgressByGoalIdAndDateRange(g.getId(), startDate.atStartOfDay(), endDate.atTime(LocalTime.MAX));
                cumulativeProgress = goalProgressRepository.sumTotalProgressByGoalId(g.getId());
                
                progressPct = BigDecimal.ZERO;
                if (g.getTargetValue() != null && g.getTargetValue().compareTo(BigDecimal.ZERO) > 0) {
                    progressPct = cumulativeProgress.divide(g.getTargetValue(), 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100));
                }
                if (progressPct.compareTo(new BigDecimal("100")) > 0) {
                    progressPct = new BigDecimal("100");
                }
            }

            boolean needsAttention = g.getStatus() == GoalStatus.ACTIVE && g.getTargetDate().isBefore(LocalDate.now());

            return GoalPerformancePageDTO.GoalPerformanceDTO.builder()
                    .goalId(g.getId())
                    .goalName(g.getTitle())
                    .goalType(g.getGoalType().name())
                    .isAutomatic(isAutomatic)
                    .targetValue(g.getTargetValue())
                    .unit(g.getUnit())
                    .progressInPeriod(progressInPeriod)
                    .cumulativeProgress(cumulativeProgress)
                    .progressPercentage(progressPct)
                    .budgetUsedInPeriod(budgetUsedInPeriod)
                    .budgetCumulativeUsed(budgetCumulativeUsed)
                    .budgetRemaining(budgetRemaining)
                    .budgetUsagePercentage(budgetUsagePercentage)
                    .targetDate(g.getTargetDate().toString())
                    .status(g.getStatus().name())
                    .needsAttention(needsAttention)
                    .build();
        }).collect(Collectors.toList());

        return GoalPerformancePageDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .goals(dtos)
                .currentPage(goalsPage.getNumber())
                .totalPages(goalsPage.getTotalPages())
                .totalElements(goalsPage.getTotalElements())
                .hasNext(goalsPage.hasNext())
                .build();
    }

    public GoalReportDTO getGoalReport(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Goal> allGoals = goalRepository.findByUserId(userId, Pageable.unpaged()).getContent();

        List<Goal> filteredGoals = allGoals.stream()
                .filter(g -> {
                    LocalDate created = g.getCreatedAt().toLocalDate();
                    return (!created.isAfter(endDate) && !g.getTargetDate().isBefore(startDate));
                })
                .collect(Collectors.toList());

        int active = 0, completed = 0, failed = 0;
        List<GoalReportDTO.GoalDetail> details = filteredGoals.stream().map(g -> {
            BigDecimal currentValue = goalProgressRepository.sumProgressByGoalIdAndDateRange(
                    g.getId(), startDate.atStartOfDay(), endDate.atTime(LocalTime.MAX));

            BigDecimal progressPct = BigDecimal.ZERO;
            if (g.getTargetValue() != null && g.getTargetValue().compareTo(BigDecimal.ZERO) > 0) {
                progressPct = currentValue.divide(g.getTargetValue(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
            return GoalReportDTO.GoalDetail.builder()
                    .title(g.getTitle())
                    .type(g.getGoalType().name())
                    .status(g.getStatus().name())
                    .targetValue(g.getTargetValue())
                    .currentValue(currentValue)
                    .unit(g.getUnit())
                    .targetDate(g.getTargetDate().format(DATE_FORMATTER))
                    .progressPercentage(progressPct)
                    .build();
        }).collect(Collectors.toList());

        for (Goal g : filteredGoals) {
            if (g.getStatus() == GoalStatus.ACTIVE) active++;
            else if (g.getStatus() == GoalStatus.ACHIEVED) completed++;
            else if (g.getStatus() == GoalStatus.EXPIRED || g.getStatus() == GoalStatus.ABANDONED) failed++;
        }

        return GoalReportDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalGoals(filteredGoals.size())
                .activeGoals(active)
                .completedGoals(completed)
                .failedGoals(failed)
                .goals(details)
                .build();
    }


    public ChallengeAnalyticsDTO getChallengeAnalytics(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;

        long totalParticipated = challengeParticipantRepository.countParticipatedByUserIdAndDateRange(userId, start, end);
        long completedChallenges = challengeParticipantRepository.countCompletedByUserIdAndDateRange(userId, start, end);

        BigDecimal completionRate = BigDecimal.ZERO;
        if (totalParticipated > 0) {
            completionRate = BigDecimal.valueOf(completedChallenges)
                    .multiply(new BigDecimal("100"))
                    .divide(BigDecimal.valueOf(totalParticipated), 1, RoundingMode.HALF_UP);
        }

        Long totalXpEarned = xpLedgerRepository.findSumByUserIdAndSourceTypeAndAwardedAtBetween(userId, XpSourceType.CHALLENGE_COMPLETED, start, end);
        if (totalXpEarned == null) totalXpEarned = 0L;

        // Previous period
        LocalDate prevStartDate = startDate.minusDays(days);
        LocalDate prevEndDate = startDate.minusDays(1);
        LocalDateTime prevStart = prevStartDate.atStartOfDay();
        LocalDateTime prevEnd = prevEndDate.atTime(LocalTime.MAX);

        long prevCompleted = challengeParticipantRepository.countCompletedByUserIdAndDateRange(userId, prevStart, prevEnd);
        Long prevXp = xpLedgerRepository.findSumByUserIdAndSourceTypeAndAwardedAtBetween(userId, XpSourceType.CHALLENGE_COMPLETED, prevStart, prevEnd);
        if (prevXp == null) prevXp = 0L;

        BigDecimal completionChangePercentage = BigDecimal.ZERO;
        String completionDirection;
        if (prevCompleted == 0) {
            completionDirection = "NO_PREVIOUS_DATA";
        } else {
            completionChangePercentage = BigDecimal.valueOf(completedChallenges - prevCompleted)
                    .multiply(new BigDecimal("100"))
                    .divide(BigDecimal.valueOf(prevCompleted), 1, RoundingMode.HALF_UP);
            if (completionChangePercentage.compareTo(BigDecimal.ZERO) > 0) completionDirection = "IMPROVED";
            else if (completionChangePercentage.compareTo(BigDecimal.ZERO) < 0) completionDirection = "DECREASED";
            else completionDirection = "NO_CHANGE";
        }

        BigDecimal xpChangePercentage = BigDecimal.ZERO;
        String xpDirection;
        if (prevXp == 0) {
            xpDirection = "NO_PREVIOUS_DATA";
        } else {
            xpChangePercentage = BigDecimal.valueOf(totalXpEarned - prevXp)
                    .multiply(new BigDecimal("100"))
                    .divide(BigDecimal.valueOf(prevXp), 1, RoundingMode.HALF_UP);
            if (xpChangePercentage.compareTo(BigDecimal.ZERO) > 0) xpDirection = "IMPROVED";
            else if (xpChangePercentage.compareTo(BigDecimal.ZERO) < 0) xpDirection = "DECREASED";
            else xpDirection = "NO_CHANGE";
        }

        List<Object[]> statusDistRaw = challengeParticipantRepository.getParticipantStatusDistribution(userId);
        Map<String, Long> statusDistribution = new HashMap<>();
        for (Object[] row : statusDistRaw) {
            ChallengeParticipantStatus status = (ChallengeParticipantStatus) row[0];
            Long count = (Long) row[1];
            statusDistribution.put(status.name(), count);
        }

        List<ChallengeAnalyticsDTO.ChallengeTrendDTO> trend = new ArrayList<>();
        if (days > 60) {
            List<MonthlyCompletionProjection> monthly = challengeParticipantRepository.getMonthlyCompletionTrend(userId, start, end);
            for (MonthlyCompletionProjection p : monthly) {
                String monthStr = String.format("%04d-%02d", p.getYear(), p.getMonth());
                trend.add(ChallengeAnalyticsDTO.ChallengeTrendDTO.builder().date(monthStr).count(p.getCount()).build());
            }
        } else {
            List<DailyCompletionProjection> daily = challengeParticipantRepository.getDailyCompletionTrend(userId, start, end);
            for (DailyCompletionProjection p : daily) {
                trend.add(ChallengeAnalyticsDTO.ChallengeTrendDTO.builder().date(p.getDate().toString()).count(p.getCount()).build());
            }
        }

        List<String> insights = new ArrayList<>();
        if (totalParticipated > 0 && completedChallenges == 0) {
            insights.add("You joined challenges but haven't completed any this period.");
        } else if ("IMPROVED".equals(completionDirection)) {
            insights.add("You completed " + completionChangePercentage.abs() + "% more challenges compared to the previous period.");
        }
        if (totalXpEarned > 0) {
            insights.add("You earned " + totalXpEarned + " XP from challenges this period.");
        }

        return ChallengeAnalyticsDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalParticipated(totalParticipated)
                .completedChallenges(completedChallenges)
                .failedChallenges(statusDistribution.getOrDefault("FAILED", 0L))
                .completionRate(completionRate)
                .totalXpEarned(totalXpEarned)
                .previousPeriodCompleted(prevCompleted)
                .completionChangePercentage(completionChangePercentage.abs())
                .completionDirection(completionDirection)
                .previousPeriodXp(prevXp)
                .xpChangePercentage(xpChangePercentage.abs())
                .xpDirection(xpDirection)
                .statusDistribution(statusDistribution)
                .completionTrend(trend)
                .insights(insights)
                .build();
    }

    public ChallengePerformancePageDTO getChallengePerformance(Long userId, LocalDate startDate, LocalDate endDate, int page, int size) {
        Page<ChallengeParticipant> partPage = challengeParticipantRepository.findByUserId(userId, PageRequest.of(page, size, org.springframework.data.domain.Sort.by("joinedAt").descending()));

        List<ChallengePerformancePageDTO.ChallengePerformanceDTO> dtos = partPage.getContent().stream().map(p -> {
            BigDecimal progressPct = BigDecimal.ZERO;
            if (p.getChallenge().getTargetValue() != null && p.getChallenge().getTargetValue() > 0) {
                progressPct = p.getProgress().divide(BigDecimal.valueOf(p.getChallenge().getTargetValue()), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
            if (progressPct.compareTo(new BigDecimal("100")) > 0) {
                progressPct = new BigDecimal("100");
            }

            return ChallengePerformancePageDTO.ChallengePerformanceDTO.builder()
                    .challengeId(p.getChallenge().getId())
                    .title(p.getChallenge().getTitle())
                    .category(p.getChallenge().getChallengeEvaluationType().name())
                    .joinedDate(p.getJoinedAt().format(DATE_FORMATTER))
                    .completedDate(p.getCompletedAt() != null ? p.getCompletedAt().format(DATE_FORMATTER) : null)
                    .status(p.getStatus().name())
                    .rewardXp(p.getChallenge().getRewardXp())
                    .progressPercentage(progressPct)
                    .build();
        }).collect(Collectors.toList());

        return ChallengePerformancePageDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .challenges(dtos)
                .currentPage(partPage.getNumber())
                .totalPages(partPage.getTotalPages())
                .totalElements(partPage.getTotalElements())
                .hasNext(partPage.hasNext())
                .build();
    }

    public ChallengeReportDTO getChallengeReport(Long userId, LocalDate startDate, LocalDate endDate) {
        List<ChallengeParticipant> allParticipants = challengeParticipantRepository.findByUserId(userId, Pageable.unpaged()).getContent();

        List<ChallengeParticipant> filtered = allParticipants.stream()
                .filter(p -> {
                    LocalDate joined = p.getJoinedAt().toLocalDate();
                    return (!joined.isAfter(endDate) && (p.getCompletedAt() == null || !p.getCompletedAt().toLocalDate().isBefore(startDate)));
                })
                .collect(Collectors.toList());

        int completed = 0;
        long totalXp = 0;
        List<ChallengeReportDTO.ChallengeDetail> details = filtered.stream().map(p -> {
            BigDecimal progressPct = BigDecimal.ZERO;
            if (p.getChallenge().getTargetValue() != null && p.getChallenge().getTargetValue() > 0) {
                progressPct = p.getProgress().divide(BigDecimal.valueOf(p.getChallenge().getTargetValue()), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
            long xp = 0;
            if (p.getStatus() == ChallengeParticipantStatus.COMPLETED) {
                xp = p.getChallenge().getRewardXp();
            }
            return ChallengeReportDTO.ChallengeDetail.builder()
                    .title(p.getChallenge().getTitle())
                    .category(p.getChallenge().getChallengeEvaluationType().name())
                    .status(p.getStatus().name())
                    .progressPercentage(progressPct.doubleValue())
                    .xpEarned(xp)
                    .joinedDate(p.getJoinedAt().format(DATE_FORMATTER))
                    .completedDate(p.getCompletedAt() != null ? p.getCompletedAt().format(DATE_FORMATTER) : null)
                    .build();
        }).collect(Collectors.toList());

        for (ChallengeParticipant p : filtered) {
            if (p.getStatus() == ChallengeParticipantStatus.COMPLETED) {
                completed++;
                totalXp += p.getChallenge().getRewardXp();
            }
        }

        return ChallengeReportDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalParticipated(filtered.size())
                .completedChallenges(completed)
                .totalXpEarned(totalXp)
                .challenges(details)
                .build();
    }


    public com.ecotrack.report.dto.SustainabilityAnalyticsDTO getSustainabilityAnalytics(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        LocalDateTime prevStart = start.minusDays(days);
        LocalDateTime prevEnd = end.minusDays(days);

        // Environmental
        List<CarbonEntry> currentEntries = carbonEntryRepository.findAllWithCategoriesByUserIdAndDateRange(userId, start, end);
        BigDecimal totalEmissions = currentEntries.stream().map(CarbonEntry::getEmissionKgco2e).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CarbonEntry> prevEntries = carbonEntryRepository.findAllWithCategoriesByUserIdAndDateRange(userId, prevStart, prevEnd);
        BigDecimal prevEmissions = prevEntries.stream().map(CarbonEntry::getEmissionKgco2e).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal emissionChangePercentage = BigDecimal.ZERO;
        String emissionDirection;
        if (prevEmissions.compareTo(BigDecimal.ZERO) == 0) {
            emissionDirection = "NO_PREVIOUS_DATA";
        } else {
            emissionChangePercentage = totalEmissions.subtract(prevEmissions)
                    .multiply(new BigDecimal("100"))
                    .divide(prevEmissions, 1, RoundingMode.HALF_UP);
            if (emissionChangePercentage.compareTo(BigDecimal.ZERO) < 0) emissionDirection = "IMPROVED";
            else if (emissionChangePercentage.compareTo(BigDecimal.ZERO) > 0) emissionDirection = "INCREASED";
            else emissionDirection = "NO_CHANGE";
        }

        // Goals
        long completedGoals = goalRepository.countCompletedByUserIdAndDateRange(userId, start, end);
        long prevCompletedGoals = goalRepository.countCompletedByUserIdAndDateRange(userId, prevStart, prevEnd);

        long activeGoals = goalRepository.countActiveByUserIdAndDateRange(userId, startDate, end);

        // Challenges
        long participatedChallenges = challengeParticipantRepository.countParticipatedByUserIdAndDateRange(userId, start, end);
        long completedChallenges = challengeParticipantRepository.countCompletedByUserIdAndDateRange(userId, start, end);
        long prevCompletedChallenges = challengeParticipantRepository.countCompletedByUserIdAndDateRange(userId, prevStart, prevEnd);

        // XP
        Long currentXpObj = xpLedgerRepository.findSumByUserIdAndAwardedAtBetween(userId, start, end);
        long periodXpEarned = currentXpObj != null ? currentXpObj : 0L;

        Long prevXpObj = xpLedgerRepository.findSumByUserIdAndAwardedAtBetween(userId, prevStart, prevEnd);
        long previousPeriodXpEarned = prevXpObj != null ? prevXpObj : 0L;

        // Gamification (Current State)
        UserGamificationProfile profile = gamificationProfileRepository.findByUserId(userId).orElse(null);
        int currentEcoScore = profile != null && profile.getCurrentEcoScore() != null ? profile.getCurrentEcoScore().intValue() : 0;
        int currentLevel = profile != null ? profile.getCurrentLevel() : 1;
        int currentStreak = profile != null && profile.getCurrentStreak() != null ? profile.getCurrentStreak() : 0;

        // Insights & Recommendations
        List<String> insights = new ArrayList<>();
        String recommendedFocus = null;

        if ("IMPROVED".equals(emissionDirection)) {
            insights.add("Your carbon emissions decreased by " + emissionChangePercentage.abs() + "% compared to the previous period.");
        } else if ("INCREASED".equals(emissionDirection)) {
            insights.add("Your carbon emissions increased by " + emissionChangePercentage.abs() + "% compared to the previous period.");
            recommendedFocus = "Emissions are rising. Review your Carbon Analytics to identify your highest emission categories and set reduction goals.";
        }

        if (completedGoals > prevCompletedGoals) {
            insights.add("Great job! You completed more goals than the previous period.");
        } else if (activeGoals > 0 && completedGoals == 0) {
            if (recommendedFocus == null) {
                recommendedFocus = "You have " + activeGoals + " active goals but none were completed this period. Review your Goals Analytics to update your progress.";
            }
        }

        if (periodXpEarned > 0) {
            insights.add("You earned " + periodXpEarned + " XP this period towards your EcoScore.");
        }

        if (participatedChallenges > 0 && completedChallenges == 0 && recommendedFocus == null) {
            recommendedFocus = "You are participating in challenges. Focus on completing them to earn Challenge XP and improve your EcoScore.";
        }

        if (insights.isEmpty()) {
            insights.add("Keep tracking your daily activities to build your sustainability profile.");
        }

        if (recommendedFocus == null) {
            recommendedFocus = "Explore new Goals or Challenges to boost your sustainability impact and EcoScore.";
        }

        return com.ecotrack.report.dto.SustainabilityAnalyticsDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalEmissions(totalEmissions)
                .previousPeriodEmissions(prevEmissions)
                .emissionChangePercentage(emissionChangePercentage.abs())
                .emissionDirection(emissionDirection)
                .completedGoals(completedGoals)
                .activeGoals(activeGoals)
                .previousCompletedGoals(prevCompletedGoals)
                .completedChallenges(completedChallenges)
                .participatedChallenges(participatedChallenges)
                .previousCompletedChallenges(prevCompletedChallenges)
                .periodXpEarned(periodXpEarned)
                .previousPeriodXpEarned(previousPeriodXpEarned)
                .currentEcoScore(currentEcoScore)
                .currentLevel(currentLevel)
                .currentStreak(currentStreak)
                .insights(insights)
                .recommendedFocus(recommendedFocus)
                .build();
    }

    public SustainabilityReportDTO getSustainabilityReport(Long userId, LocalDate startDate, LocalDate endDate) {
        CarbonReportDTO carbon = getCarbonReport(userId, startDate, endDate);
        GoalReportDTO goals = getGoalReport(userId, startDate, endDate);
        ChallengeReportDTO challenges = getChallengeReport(userId, startDate, endDate);

        UserGamificationProfile profile = gamificationProfileRepository.findByUserId(userId).orElse(null);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        
        org.springframework.data.domain.Pageable unpaged = org.springframework.data.domain.Pageable.unpaged();
        org.springframework.data.domain.Page<com.ecotrack.gamification.entity.XpLedger> xpPage = xpLedgerRepository.findByUser_IdAndAwardedAtBetweenOrderByAwardedAtDesc(userId, start, end, unpaged);
        
        List<com.ecotrack.report.dto.XpTransactionDTO> txList = xpPage.getContent().stream()
                .map(x -> com.ecotrack.report.dto.XpTransactionDTO.builder()
                        .id(x.getId())
                        .amount(x.getXpAwarded())
                        .source(x.getSourceType().name())
                        .description(switch (x.getSourceType()) {
                            case CARBON_ENTRY -> "Carbon Entry";
                            case GOAL_COMPLETED -> "Goal Completed";
                            case CHALLENGE_COMPLETED -> "Challenge Completed";
                            case STREAK_BONUS -> "Streak Bonus";
                            case DAILY_LOGIN -> "Daily Login";
                            case BADGE_BONUS -> "Badge Bonus";
                            case CARBON_ENTRY_DELETED -> "Carbon Entry Deleted";
                            case GOAL_DELETED -> "Goal Deleted";
                            default -> x.getSourceType().name();
                        })
                        .timestamp(x.getAwardedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                        .build())
                .collect(Collectors.toList());

        return SustainabilityReportDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalEmissions(carbon.getTotalEmissions())
                .totalGoals(goals.getTotalGoals())
                .completedGoals(goals.getCompletedGoals())
                .completedChallenges(challenges.getCompletedChallenges())
                .xpEarned(challenges.getTotalXpEarned())
                .currentEcoScore(profile != null && profile.getCurrentEcoScore() != null ? profile.getCurrentEcoScore().intValue() : 0)
                .currentRank(profile != null ? "Level " + profile.getCurrentLevel() : "NONE")
                .xpTransactions(txList)
                .build();
    }

    public com.ecotrack.report.dto.OverviewReportDTO getOverviewReport(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<CarbonEntry> entries = carbonEntryRepository.findAllWithCategoriesByUserIdAndDateRange(userId, start, end);
        BigDecimal totalEmissions = entries.stream()
                .map(CarbonEntry::getEmissionKgco2e)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int activeGoals = (int) goalRepository.countActiveByUserIdAndDateRange(userId, startDate, end);
        int completedGoals = (int) goalRepository.countCompletedByUserIdAndDateRange(userId, start, end);
        int completedChallenges = (int) challengeParticipantRepository.countCompletedByUserIdAndDateRange(userId, start, end);

        Long xpEarned = xpLedgerRepository.findSumByUserIdAndAwardedAtBetween(userId, start, end);

        UserGamificationProfile profile = gamificationProfileRepository.findByUserId(userId).orElse(null);

        return com.ecotrack.report.dto.OverviewReportDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .totalEmissions(totalEmissions)
                .activeGoals(activeGoals)
                .completedGoals(completedGoals)
                .completedChallenges(completedChallenges)
                .periodXpEarned(xpEarned != null ? xpEarned : 0)
                .currentEcoScore(profile != null && profile.getCurrentEcoScore() != null ? profile.getCurrentEcoScore().intValue() : 0)
                .currentLevel(profile != null ? profile.getCurrentLevel() : 0)
                .build();
    }

    public com.ecotrack.report.dto.XpActivityPageDTO getXpActivityReport(Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        org.springframework.data.domain.Page<com.ecotrack.gamification.entity.XpLedger> page = xpLedgerRepository.findByUser_IdAndAwardedAtBetweenOrderByAwardedAtDesc(userId, start, end, pageable);
        Long xpEarned = xpLedgerRepository.findSumByUserIdAndAwardedAtBetween(userId, start, end);

        List<com.ecotrack.report.dto.XpTransactionDTO> transactions = page.getContent().stream()
                .map(x -> com.ecotrack.report.dto.XpTransactionDTO.builder()
                        .id(x.getId())
                        .amount(x.getXpAwarded())
                        .source(x.getSourceType().name())
                        .description(switch (x.getSourceType()) {
                            case CARBON_ENTRY -> "Carbon Entry";
                            case GOAL_COMPLETED -> "Goal Completed";
                            case CHALLENGE_COMPLETED -> "Challenge Completed";
                            case STREAK_BONUS -> "Streak Bonus";
                            case DAILY_LOGIN -> "Daily Login";
                            case BADGE_BONUS -> "Badge Bonus";
                            default -> x.getSourceType().name();
                        })
                        .timestamp(x.getAwardedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                        .build())
                .collect(Collectors.toList());

        return com.ecotrack.report.dto.XpActivityPageDTO.builder()
                .startDate(startDate.format(DATE_FORMATTER))
                .endDate(endDate.format(DATE_FORMATTER))
                .periodXpEarned(xpEarned != null ? xpEarned : 0)
                .transactions(transactions)
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .hasNext(page.hasNext())
                .build();
    }
}
