package com.ecotrack.dashboard.ai.dto;

import java.math.BigDecimal;
import java.util.List;

public record UnifiedInsightsContext(
    BigDecimal currentEmission,
    BigDecimal previousEmission,
    BigDecimal percentageChange,
    String trendDirection,
    String dominantCategory,
    List<String> concerningPatterns,
    List<String> positivePatterns,
    String rawJournalData
) {}
