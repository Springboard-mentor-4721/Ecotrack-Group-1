package com.ecotrack.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GamificationSummaryDTO {
    private BigDecimal currentEcoScore;
    private Long lifetimeEcoXp;
    private Integer currentLevel;
    private Integer currentStreak;
    private List<BadgeDTO> recentBadges;
}
