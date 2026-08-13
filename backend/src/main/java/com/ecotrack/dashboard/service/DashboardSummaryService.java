package com.ecotrack.dashboard.service;

import com.ecotrack.dashboard.dto.DashboardSummaryDTO;

public interface DashboardSummaryService {
    DashboardSummaryDTO getDashboardSummary(String userEmail);
}
