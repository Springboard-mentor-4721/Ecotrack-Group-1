package com.ecotrack.goal.dto;

import com.ecotrack.goal.entity.enums.GoalStatus;
import com.ecotrack.goal.entity.enums.GoalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {

    private Long id;
    private GoalType goalType;
    private String title;
    private String description;
    private BigDecimal targetValue;
    private String unit;
    private LocalDate targetDate;
    private GoalStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
