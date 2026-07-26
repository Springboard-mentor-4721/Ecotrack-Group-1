package com.ecotrack.dashboard.service;

import com.ecotrack.dashboard.dto.*;
import com.ecotrack.goal.entity.enums.GoalStatus;
import com.ecotrack.goal.repository.GoalRepository;
import com.ecotrack.tracking.entity.CarbonEntry;
import com.ecotrack.tracking.repository.CarbonEntryRepository;
import com.ecotrack.tracking.repository.projection.CategoryEmissionProjection;
import com.ecotrack.tracking.repository.projection.MonthlyEmissionProjection;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final CarbonEntryRepository carbonEntryRepository;
    private final GoalRepository goalRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardData(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Long userId = user.getId();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneMonthAgo = now.minusMonths(1);
        LocalDateTime oneWeekAgo = now.minusWeeks(1);
        LocalDateTime sixMonthsAgo = now.minusMonths(5).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime epoch = LocalDateTime.of(2000, 1, 1, 0, 0);

        return DashboardResponse.builder()
                .userSummary(buildUserSummary(userId, now, oneMonthAgo, oneWeekAgo, epoch))
                .goalSummary(buildGoalSummary(userId))
                .monthlyTrend(buildMonthlyTrend(userId, sixMonthsAgo, now))
                .categoryBreakdown(buildCategoryBreakdown(userId, epoch, now))
                .recentActivities(buildRecentActivities(userId))
                .ecoScore(new EcoScoreDTO(0, "Pending"))
                .build();
    }

    private UserSummaryDTO buildUserSummary(Long userId, LocalDateTime now, LocalDateTime oneMonthAgo, LocalDateTime oneWeekAgo, LocalDateTime epoch) {
        long totalEntries = carbonEntryRepository.countByUserIdAndEntryDateBetween(userId, epoch, now);
        BigDecimal totalEmission = sumEmissions(userId, epoch, now);
        BigDecimal monthlyEmission = sumEmissions(userId, oneMonthAgo, now);
        BigDecimal weeklyEmission = sumEmissions(userId, oneWeekAgo, now);

        return UserSummaryDTO.builder()
                .totalEmission(totalEmission)
                .monthlyEmission(monthlyEmission)
                .weeklyEmission(weeklyEmission)
                .totalEntries(totalEntries)
                .build();
    }

    private BigDecimal sumEmissions(Long userId, LocalDateTime start, LocalDateTime end) {
        return carbonEntryRepository.getEmissionSummaryByUserAndDateRange(userId, start, end)
                .stream()
                .map(CategoryEmissionProjection::getTotalEmission)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private GoalSummaryDTO buildGoalSummary(Long userId) {
        long activeGoals = goalRepository.countByUserIdAndStatus(userId, GoalStatus.ACTIVE);
        long completedGoals = goalRepository.countByUserIdAndStatus(userId, GoalStatus.ACHIEVED);
        long expiredGoals = goalRepository.countByUserIdAndStatus(userId, GoalStatus.EXPIRED);
        long totalGoals = activeGoals + completedGoals + expiredGoals;
        double completionPercentage = totalGoals > 0 ? (completedGoals * 100.0) / totalGoals : 0.0;

        return GoalSummaryDTO.builder()
                .activeGoals(activeGoals)
                .completedGoals(completedGoals)
                .expiredGoals(expiredGoals)
                .completionPercentage(completionPercentage)
                .build();
    }

    private List<CarbonTrendDTO> buildMonthlyTrend(Long userId, LocalDateTime start, LocalDateTime end) {
        List<MonthlyEmissionProjection> projections = carbonEntryRepository.getMonthlyEmissionSummary(userId, start, end);
        
        Map<YearMonth, BigDecimal> dbMap = projections.stream()
                .collect(Collectors.toMap(
                        p -> YearMonth.of(p.getYear(), p.getMonth()),
                        p -> p.getTotalEmission() != null ? p.getTotalEmission() : BigDecimal.ZERO
                ));

        Map<YearMonth, BigDecimal> monthlyEmissionsMap = new HashMap<>();
        for (int i = 0; i < 6; i++) {
            YearMonth ym = YearMonth.from(end.minusMonths(i));
            monthlyEmissionsMap.put(ym, dbMap.getOrDefault(ym, BigDecimal.ZERO));
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);
        return monthlyEmissionsMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new CarbonTrendDTO(e.getKey().format(formatter), e.getValue()))
                .collect(Collectors.toList());
    }

    private List<CategoryBreakdownDTO> buildCategoryBreakdown(Long userId, LocalDateTime start, LocalDateTime end) {
        List<CategoryEmissionProjection> totalProjections = carbonEntryRepository.getEmissionSummaryByUserAndDateRange(userId, start, end);
        BigDecimal totalEmission = totalProjections.stream()
                .map(CategoryEmissionProjection::getTotalEmission)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalProjections.stream()
                .filter(proj -> proj.getTotalEmission() != null && proj.getTotalEmission().compareTo(BigDecimal.ZERO) > 0)
                .map(proj -> {
                    BigDecimal percentage = BigDecimal.ZERO;
                    if (totalEmission.compareTo(BigDecimal.ZERO) > 0) {
                        percentage = proj.getTotalEmission()
                                .divide(totalEmission, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .setScale(1, RoundingMode.HALF_UP);
                    }
                    return new CategoryBreakdownDTO(proj.getCategoryName(), proj.getTotalEmission(), percentage);
                }).collect(Collectors.toList());
    }

    private List<RecentActivityDTO> buildRecentActivities(Long userId) {
        List<CarbonEntry> top5 = carbonEntryRepository.findTop5ByUserIdOrderByEntryDateDesc(userId);
        return top5.stream()
                .map(entry -> new RecentActivityDTO(
                        entry.getSubCategory().getCategory().getName(),
                        entry.getSubCategory().getName(),
                        entry.getEmissionKgco2e(),
                        entry.getEntryDate()
                )).collect(Collectors.toList());
    }
}
