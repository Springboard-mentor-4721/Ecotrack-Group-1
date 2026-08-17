package com.ecotrack.admin.controller;

import com.ecotrack.admin.dto.analytics.*;
import com.ecotrack.admin.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ModelAttribute;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AdminAnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<AdminOverviewAnalyticsDTO> getOverview() {
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    @GetMapping("/users")
    public ResponseEntity<AdminUserAnalyticsDTO> getUsers(@ModelAttribute AdminAnalyticsFilter filter) {
        return ResponseEntity.ok(analyticsService.getUserAnalytics(filter));
    }

    @GetMapping("/gamification")
    public ResponseEntity<AdminGamificationAnalyticsDTO> getGamification(@ModelAttribute AdminAnalyticsFilter filter) {
        return ResponseEntity.ok(analyticsService.getGamificationAnalytics(filter));
    }

    @GetMapping("/badges")
    public ResponseEntity<AdminBadgeAnalyticsDTO> getBadges(@ModelAttribute AdminAnalyticsFilter filter) {
        return ResponseEntity.ok(analyticsService.getBadgeAnalytics(filter));
    }

    @GetMapping("/challenges")
    public ResponseEntity<AdminChallengeAnalyticsDTO> getChallenges(@ModelAttribute AdminAnalyticsFilter filter) {
        return ResponseEntity.ok(analyticsService.getChallengeAnalytics(filter));
    }

    @GetMapping("/sustainability")
    public ResponseEntity<AdminSustainabilityAnalyticsDTO> getSustainability(@ModelAttribute AdminAnalyticsFilter filter) {
        return ResponseEntity.ok(analyticsService.getSustainabilityAnalytics(filter));
    }
}
