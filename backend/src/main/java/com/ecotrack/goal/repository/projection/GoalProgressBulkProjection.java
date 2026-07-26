package com.ecotrack.goal.repository.projection;

import java.math.BigDecimal;

public interface GoalProgressBulkProjection {
    Long getGoalId();
    BigDecimal getTotalProgress();
}
