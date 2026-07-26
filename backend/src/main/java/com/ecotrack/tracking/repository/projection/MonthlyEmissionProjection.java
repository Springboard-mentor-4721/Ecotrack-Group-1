package com.ecotrack.tracking.repository.projection;

import java.math.BigDecimal;

public interface MonthlyEmissionProjection {
    Integer getYear();
    Integer getMonth();
    BigDecimal getTotalEmission();
}
