package com.ecotrack.tracking.mapper;

import com.ecotrack.tracking.dto.CarbonEntryResponse;
import com.ecotrack.tracking.dto.CreateCarbonEntryRequest;
import com.ecotrack.tracking.dto.UpdateCarbonEntryRequest;
import com.ecotrack.tracking.entity.CarbonEntry;
import org.springframework.stereotype.Component;

@Component
public class CarbonEntryMapper {

    public CarbonEntry toEntity(CreateCarbonEntryRequest request) {
        if (request == null) {
            return null;
        }

        return CarbonEntry.builder()
                .quantity(request.getQuantity())
                .entryDate(request.getEntryDate())
                .notes(request.getNotes())
                .build();
    }

    public void updateEntity(UpdateCarbonEntryRequest request, CarbonEntry entity) {
        if (request == null || entity == null) {
            return;
        }
        
        entity.setQuantity(request.getQuantity());
        entity.setEntryDate(request.getEntryDate());
        entity.setNotes(request.getNotes());
    }

    public CarbonEntryResponse toResponse(CarbonEntry entity) {
        if (entity == null) {
            return null;
        }

        return CarbonEntryResponse.builder()
                .id(entity.getId())
                .subCategoryId(entity.getSubCategory() != null ? entity.getSubCategory().getId() : null)
                .categoryId(entity.getSubCategory() != null && entity.getSubCategory().getCategory() != null ? entity.getSubCategory().getCategory().getCategoryId() : null)
                .categoryName(entity.getSubCategory() != null && entity.getSubCategory().getCategory() != null ? entity.getSubCategory().getCategory().getName() : null)
                .subType(entity.getSubCategory() != null ? entity.getSubCategory().getName() : null)
                .quantity(entity.getQuantity())
                .unit(entity.getSubCategory() != null ? entity.getSubCategory().getDefaultUnit() : null)
                .emissionKgco2e(entity.getEmissionKgco2e())
                .entryDate(entity.getEntryDate())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
