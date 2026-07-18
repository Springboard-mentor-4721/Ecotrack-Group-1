package com.ecotrack.goal.dto;

import com.ecotrack.goal.enums.GoalStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class GoalResponse {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private Double targetValue;
    private Double currentValue;
    private String unit;
    private LocalDate targetDate;
    private GoalStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
