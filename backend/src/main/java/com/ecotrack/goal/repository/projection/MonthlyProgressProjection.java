package com.ecotrack.goal.repository.projection;

import java.math.BigDecimal;

public interface MonthlyProgressProjection {
    Integer getYear();
    Integer getMonth();
    BigDecimal getTotalProgress();
}
