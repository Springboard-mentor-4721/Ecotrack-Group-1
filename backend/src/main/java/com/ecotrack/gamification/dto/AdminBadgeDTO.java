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
public class AdminBadgeDTO {
    private Long id;
    private String name;
    private String category;
    private String description;
    private String rarity;
    private BadgeType type;
    private String icon;
    private String color;
    private Boolean isHidden;
    private Boolean isRepeatable;
    private String criteriaType;
    private Integer criteriaThreshold;
    private LocalDateTime createdAt;
}
