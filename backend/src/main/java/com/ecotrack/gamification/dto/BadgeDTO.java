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
public class BadgeDTO {
    private Long id;
    private String name;
    private String category;
    private String description;
    private String rarity;
    private Boolean isEarned;
    private LocalDateTime awardedAt;
}
