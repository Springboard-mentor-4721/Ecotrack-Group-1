package com.ecotrack.goal.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GoalProgressResponse {
    private Long id;
    private Long goalId;
    private Double progressValue;
    private String notes;
    private LocalDateTime createdAt;
}
