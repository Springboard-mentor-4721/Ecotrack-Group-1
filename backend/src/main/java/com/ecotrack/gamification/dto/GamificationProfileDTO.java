package com.ecotrack.gamification.dto;

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
public class GamificationProfileDTO {
    private Long userId;
    private BigDecimal currentEcoScore;
    private Long lifetimeEcoXp;
    private Integer currentLevel;
    private Integer currentStreak;
    private LocalDateTime lastScoreUpdateAt;
}
