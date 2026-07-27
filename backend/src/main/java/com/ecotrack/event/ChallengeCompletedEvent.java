package com.ecotrack.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeCompletedEvent {
    private Long userId;
    private Long challengeId;
    private String challengeTitle;
}
