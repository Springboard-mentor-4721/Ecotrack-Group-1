package com.ecotrack.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonCategoryDto {
    private Long id;
    private String name;
    private String code;
    private Integer displayOrder;
    private String icon;
    private String color;
    private Boolean isActive;
    private List<CarbonSubCategoryDto> subCategories;
}
