package com.ecotrack.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeAnalyticsDTO {
    private Map<String, Long> challengesByStatus;
    private Map<String, Long> participationByMonth;
}
