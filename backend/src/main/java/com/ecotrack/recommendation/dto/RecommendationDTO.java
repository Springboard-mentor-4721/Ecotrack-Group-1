package com.ecotrack.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDTO {
    private Long id;
    private Long userId;
    private String category;
    private String recommendation;
    private BigDecimal estimatedReductionKgco2e;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
