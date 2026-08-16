package com.ecotrack.recommendation.dto;

public interface CategorySummaryProjection {
    String getCategoryCode();
    Number getTotalVolume();
    Number getEntryCount();
}
