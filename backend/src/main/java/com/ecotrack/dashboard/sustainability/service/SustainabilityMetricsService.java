package com.ecotrack.dashboard.sustainability.service;

import com.ecotrack.dashboard.sustainability.dto.BehaviorMetrics;
import com.ecotrack.dashboard.sustainability.dto.TrendMetrics;
import com.ecotrack.tracking.dto.CarbonSummaryResponse;
import com.ecotrack.tracking.dto.CategoryEmissionResponse;
import com.ecotrack.tracking.service.CarbonEntryService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class SustainabilityMetricsService {

    private final CarbonEntryService carbonEntryService;

    public SustainabilityMetricsService(CarbonEntryService carbonEntryService) {
        this.carbonEntryService = carbonEntryService;
    }

    public TrendMetrics calculateTrend(Long userId, LocalDate today, int days) {
        LocalDate currentStart = today.minusDays(days);
        LocalDate previousStart = currentStart.minusDays(days);

        CarbonSummaryResponse current = carbonEntryService.getDashboardSummary(userId, currentStart, today);
        CarbonSummaryResponse previous = carbonEntryService.getDashboardSummary(userId, previousStart, currentStart);

        BigDecimal currentEmission = current.getTotalEmission() != null ? current.getTotalEmission() : BigDecimal.ZERO;
        BigDecimal previousEmission = previous.getTotalEmission() != null ? previous.getTotalEmission() : BigDecimal.ZERO;

        BigDecimal percentageChange = BigDecimal.ZERO;
        String direction = "STABLE";

        if (previousEmission.compareTo(BigDecimal.ZERO) > 0) {
            percentageChange = currentEmission.subtract(previousEmission)
                    .divide(previousEmission, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            
            if (percentageChange.compareTo(BigDecimal.valueOf(5)) > 0) {
                direction = "WORSENING";
            } else if (percentageChange.compareTo(BigDecimal.valueOf(-5)) < 0) {
                direction = "IMPROVING";
            }
        } else if (currentEmission.compareTo(BigDecimal.ZERO) > 0) {
            direction = "WORSENING";
            percentageChange = BigDecimal.valueOf(100);
        }

        BigDecimal avgDaily = currentEmission.divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP);

        return new TrendMetrics(currentEmission, previousEmission, percentageChange, direction, avgDaily);
    }

    public BehaviorMetrics calculateBehavior(Long userId, LocalDate today, int days) {
        LocalDate start = today.minusDays(days);
        CarbonSummaryResponse summary = carbonEntryService.getDashboardSummary(userId, start, today);

        List<String> positive = new ArrayList<>();
        List<String> concerning = new ArrayList<>();
        String dominant = "None";
        List<String> improvements = new ArrayList<>();

        if (summary != null && summary.getCategorySummaries() != null && !summary.getCategorySummaries().isEmpty()) {
            CategoryEmissionResponse maxCat = summary.getCategorySummaries().get(0);
            dominant = maxCat.getCategoryName();
            
            if (maxCat.getPercentage().compareTo(BigDecimal.valueOf(50)) > 0) {
                concerning.add(maxCat.getCategoryName() + " makes up over 50% of your emissions.");
                improvements.add("Focus on reducing " + maxCat.getCategoryName() + " usage.");
            } else {
                positive.add("Your emissions are relatively balanced across categories.");
            }
            
            if (summary.getTotalEmission().compareTo(BigDecimal.valueOf(100)) < 0) { // Arbitrary small threshold for demo
                positive.add("Your overall carbon footprint is quite low this period.");
            }
        } else {
            improvements.add("Log more entries to discover behavioral patterns.");
        }

        return new BehaviorMetrics(positive, concerning, dominant, improvements);
    }
}
