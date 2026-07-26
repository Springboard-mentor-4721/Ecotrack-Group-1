package com.ecotrack.dashboard.service;

import com.ecotrack.dashboard.dto.DashboardResponse;

public interface DashboardService {
    DashboardResponse getDashboardData(String userEmail);
}
