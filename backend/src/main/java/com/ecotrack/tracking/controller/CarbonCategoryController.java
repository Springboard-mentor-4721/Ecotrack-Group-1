package com.ecotrack.tracking.controller;

import com.ecotrack.tracking.dto.CarbonCategoryDto;
import com.ecotrack.tracking.dto.CarbonSubCategoryDto;
import com.ecotrack.tracking.repository.CarbonCategoryRepository;
import com.ecotrack.tracking.repository.CarbonSubCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/carbon/categories")
@RequiredArgsConstructor
public class CarbonCategoryController {

    private final CarbonCategoryRepository categoryRepository;
    private final CarbonSubCategoryRepository subCategoryRepository;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<CarbonCategoryDto>> getAllCategories() {
        var subCategories = subCategoryRepository.findAll();
        
        var categories = categoryRepository.findAll().stream()
            .sorted(java.util.Comparator.comparing(com.ecotrack.tracking.entity.CarbonCategory::getDisplayOrder))
            .map(cat -> {
            var subs = subCategories.stream()
                .filter(sub -> sub.getCategory().getCategoryId().equals(cat.getCategoryId()))
                .map(sub -> CarbonSubCategoryDto.builder()
                    .id(sub.getId())
                    .categoryId(cat.getCategoryId())
                    .name(sub.getName())
                    .defaultUnit(sub.getDefaultUnit())
                    .build())
                .collect(Collectors.toList());

            return CarbonCategoryDto.builder()
                .id(cat.getCategoryId())
                .name(cat.getName())
                .code(cat.getCode())
                .displayOrder(cat.getDisplayOrder())
                .icon(cat.getIcon())
                .color(cat.getColor())
                .isActive(cat.getIsActive())
                .subCategories(subs)
                .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(categories);
    }
}
