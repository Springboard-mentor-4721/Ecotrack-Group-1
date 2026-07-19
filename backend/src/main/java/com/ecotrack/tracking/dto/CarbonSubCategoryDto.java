package com.ecotrack.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonSubCategoryDto {
    private Long id;
    private Long categoryId;
    private String name;
    private String defaultUnit;
}
