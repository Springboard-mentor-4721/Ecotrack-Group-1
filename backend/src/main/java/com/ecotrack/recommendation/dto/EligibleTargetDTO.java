package com.ecotrack.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EligibleTargetDTO {
    private String categoryCode;
    private String subCategoryName;
    private String reason;
}
