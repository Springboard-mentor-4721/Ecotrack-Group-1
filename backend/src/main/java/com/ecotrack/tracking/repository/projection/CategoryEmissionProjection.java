package com.ecotrack.tracking.repository.projection;

import java.math.BigDecimal;

/**
 * Spring Data JPA Projection for the Carbon Tracking summary aggregation.
 */
public interface CategoryEmissionProjection {
    String getCategoryName();
    BigDecimal getTotalEmission();
}
