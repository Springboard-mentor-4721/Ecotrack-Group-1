package com.ecotrack.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StreakUpdatedEvent {
    private Long userId;
    private Integer streakDays;
    private String correlationId;
}
