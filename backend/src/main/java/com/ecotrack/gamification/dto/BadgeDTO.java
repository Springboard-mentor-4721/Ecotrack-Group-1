package com.ecotrack.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.ecotrack.gamification.enums.BadgeType;

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
    private BadgeType type;
    private String icon;
    private String color;
    private Boolean isEarned;
    private LocalDateTime awardedAt;
    
    // Progress fields
    private String criteriaType;
    private Integer currentValue;
    private Integer criteriaThreshold;
    private Integer xpReward;
}
