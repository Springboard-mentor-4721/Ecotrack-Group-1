package com.ecotrack.search.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChallengeSearchResponse {
    private Long id;
    private String title;
    private String description;
}
