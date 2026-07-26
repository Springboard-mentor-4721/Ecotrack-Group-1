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

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/user")
    public ResponseEntity<DashboardResponse> getUserDashboard(Authentication authentication) {
        log.info("Fetching user dashboard data");
        String userEmail = authentication.getName();
        DashboardResponse response = dashboardService.getDashboardData(userEmail);
        return ResponseEntity.ok(response);
    }
}
