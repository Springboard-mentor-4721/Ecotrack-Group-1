package com.ecotrack.challenge.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeProgressUpdateRequest {
    @NotNull(message = "Progress increment cannot be null")
    @Positive(message = "Progress increment must be positive")
    private java.math.BigDecimal delta;
}
