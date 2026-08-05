package com.ecotrack.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeStatsDTO {
    private long totalChallenges;
    private long activeCount;
    private long scheduledCount;
    private long completedCount;
    private long archivedCount;
    private long draftCount;
    private long totalParticipants;
    private double completionRate;
    private long xpDistributed;
    private double co2Impact;
    private Double totalChallengesTrend;
    private Double activeCountTrend;
    private Double scheduledCountTrend;
    private Double draftCountTrend;
}
