package com.ecotrack.gamification.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDefinitionRequest {

    @NotBlank(message = "Name cannot be blank")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Category cannot be blank")
    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotBlank(message = "Rarity cannot be blank")
    @Size(max = 20, message = "Rarity must not exceed 20 characters")
    private String rarity;

    @NotNull(message = "isHidden must not be null")
    private Boolean isHidden;

    @NotNull(message = "isRepeatable must not be null")
    private Boolean isRepeatable;

    @NotBlank(message = "Criteria type cannot be blank")
    @Size(max = 50, message = "Criteria type must not exceed 50 characters")
    private String criteriaType;

    @NotNull(message = "Criteria threshold must not be null")
    @Min(value = 1, message = "Criteria threshold must be at least 1")
    private Integer criteriaThreshold;
}
