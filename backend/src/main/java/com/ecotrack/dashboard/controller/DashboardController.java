package com.ecotrack.dashboard.controller;

import com.ecotrack.dashboard.dto.DashboardResponse;
import com.ecotrack.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final com.ecotrack.dashboard.service.DashboardSummaryService dashboardSummaryService;
    private final com.ecotrack.user.repository.UserRepository userRepository;
    private final com.ecotrack.dashboard.ai.service.DailyEcoTipService dailyEcoTipService;
    private final com.ecotrack.dashboard.ai.service.TrendPredictionService trendPredictionService;
    private final com.ecotrack.dashboard.ai.service.BehavioralInsightService behavioralInsightService;
    private final com.ecotrack.tracking.service.CarbonEntryService carbonEntryService;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/user")
    public ResponseEntity<DashboardResponse> getUserDashboard(Authentication authentication) {
        log.info("Fetching user dashboard data");
        String userEmail = authentication.getName();
        DashboardResponse response = dashboardService.getDashboardData(userEmail);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/summary")
    public ResponseEntity<com.ecotrack.dashboard.dto.DashboardSummaryDTO> getDashboardSummary(Authentication authentication) {
        log.info("Fetching unified dashboard summary");
        String userEmail = authentication.getName();
        com.ecotrack.dashboard.dto.DashboardSummaryDTO response = dashboardSummaryService.getDashboardSummary(userEmail);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/eco-tip")
    public ResponseEntity<com.ecotrack.dashboard.ai.dto.EcoTipResponse> getEcoTip(Authentication authentication) {
        Long userId = getUserId(authentication);
        String recentCategories = carbonEntryService.getRawJournalDataStringForUser(userId, "weekly"); // simplifed
        com.ecotrack.dashboard.ai.dto.EcoTipContext context = new com.ecotrack.dashboard.ai.dto.EcoTipContext(recentCategories);
        com.ecotrack.dashboard.ai.dto.EcoTipResponse response = dailyEcoTipService.getOrGenerate(userId, context);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/trend-prediction")
    public ResponseEntity<com.ecotrack.dashboard.ai.dto.TrendPredictionResponse> getTrendPrediction(Authentication authentication) {
        Long userId = getUserId(authentication);
        String historicalData = carbonEntryService.getRawJournalDataStringForUser(userId, "monthly"); // 30 days
        com.ecotrack.dashboard.ai.dto.TrendPredictionContext context = new com.ecotrack.dashboard.ai.dto.TrendPredictionContext(historicalData, java.time.LocalDate.now().toString());
        com.ecotrack.dashboard.ai.dto.TrendPredictionResponse response = trendPredictionService.getOrGenerate(userId, context);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/behavioral-insights")
    public ResponseEntity<com.ecotrack.dashboard.ai.dto.BehavioralInsightsResponse> getBehavioralInsights(Authentication authentication) {
        Long userId = getUserId(authentication);
        String longTermData = carbonEntryService.getRawJournalDataStringForUser(userId, "monthly"); // simplified to 30 days for context limits
        com.ecotrack.dashboard.ai.dto.BehavioralInsightsContext context = new com.ecotrack.dashboard.ai.dto.BehavioralInsightsContext(longTermData);
        com.ecotrack.dashboard.ai.dto.BehavioralInsightsResponse response = behavioralInsightService.getOrGenerate(userId, context);
        return ResponseEntity.ok(response);
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"))
                .getId();
    }
}
