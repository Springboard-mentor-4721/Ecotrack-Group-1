package com.ecotrack.search.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecommendationResponse {
    private String type; // "USER", "CHALLENGE"
    private String title;
    private String description;
}
