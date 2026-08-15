package com.ecotrack.challenge.repository.projection;

import java.sql.Date;

public interface DailyCompletionProjection {
    Date getDate();
    long getCount();
}
