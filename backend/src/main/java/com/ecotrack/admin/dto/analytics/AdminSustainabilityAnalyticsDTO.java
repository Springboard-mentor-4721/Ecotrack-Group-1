package com.ecotrack.admin.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSustainabilityAnalyticsDTO {
    private double totalCarbonImpact;
    private double carbonImpactInPeriod;
    
    private List<AnalyticsDistributionDTO> impactByCategory;
    private List<AnalyticsTrendPointDTO> carbonTrend;
}
