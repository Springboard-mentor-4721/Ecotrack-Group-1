package com.ecotrack.dashboard.sustainability.dto;

import java.math.BigDecimal;

public record TrendMetrics(
        BigDecimal currentPeriodEmission,
        BigDecimal previousPeriodEmission,
        BigDecimal percentageChange,
        String direction,
        BigDecimal averageDailyEmission
) {}
