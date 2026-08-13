package com.ecotrack.leaderboard;

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
public class LeaderboardEntryDTO {
    private Long userId;
    private String username;
    private Long scoreValue; // Can be XP
    private BigDecimal metricValue; // For EcoScore or Challenge progress
    private Integer rank;
    private Integer level;
    private Long xpToNextRank;
    
    // Challenge specific
    private String status;
    private LocalDateTime completedAt;
    
    // User profile
    private String profilePictureUrl;
}
