package com.ecotrack.gamification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfigUpdateRequest {
    @NotBlank(message = "Config value cannot be blank")
    private String value;
}
