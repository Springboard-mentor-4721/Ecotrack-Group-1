package com.ecotrack.goal.repository.projection;

import java.math.BigDecimal;
import java.sql.Date;

public interface DailyProgressProjection {
    Date getDate();
    BigDecimal getTotalProgress();
}
