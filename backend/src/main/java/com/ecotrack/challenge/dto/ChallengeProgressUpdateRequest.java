package com.ecotrack.challenge.dto;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeProgressUpdateRequest {
    @Positive(message = "Progress increment must be positive")
    private Integer delta;
}
