package com.ecotrack.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GamificationConfigDTO {
    private String configKey;
    private String configValue;
    private String valueType;
    private String description;
    private LocalDateTime updatedAt;
}
