package com.ecotrack.goal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalHistoryItem {
    private String type; // "AUTOMATIC" or "MANUAL"
    private LocalDateTime timestamp;
    private String title;
    private String description;
    private String source;
    private BigDecimal progressChange;
    private BigDecimal currentProgress;
}
