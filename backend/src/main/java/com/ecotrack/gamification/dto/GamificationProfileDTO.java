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
    private String currentEcoGrade;
    private Long lifetimeEcoXp;
    private Integer currentLevel;
    private Integer currentStreak;
    private Integer longestStreak;
    private Long currentLevelBaseXp;
    private Long nextLevelXp;
    private Integer totalBadges;
    private Integer earnedBadges;
    private LocalDateTime lastScoreUpdateAt;
}
