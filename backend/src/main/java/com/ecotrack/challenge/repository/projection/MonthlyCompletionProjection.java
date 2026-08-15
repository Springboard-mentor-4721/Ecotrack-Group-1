package com.ecotrack.challenge.repository.projection;

public interface MonthlyCompletionProjection {
    Integer getYear();
    Integer getMonth();
    long getCount();
}
