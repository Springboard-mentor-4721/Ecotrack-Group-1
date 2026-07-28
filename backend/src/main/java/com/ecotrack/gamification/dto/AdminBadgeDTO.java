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
public class AdminBadgeDTO {
    private Long id;
    private String name;
    private String category;
    private String description;
    private String rarity;
    private Boolean isHidden;
    private Boolean isRepeatable;
    private String criteriaType;
    private Integer criteriaThreshold;
    private LocalDateTime createdAt;
}
