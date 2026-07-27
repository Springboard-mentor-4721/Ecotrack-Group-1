package com.ecotrack.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDTO {
    private Long userId;
    private String username;
    private Long scoreValue; // Can be XP or EcoScore scaled
    private Integer rank;
}
