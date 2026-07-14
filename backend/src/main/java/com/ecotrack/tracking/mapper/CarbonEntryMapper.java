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
                .subType(request.getSubType())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .entryDate(request.getEntryDate())
                .notes(request.getNotes())
                .build();
    }

    public void updateEntity(UpdateCarbonEntryRequest request, CarbonEntry entity) {
        if (request == null || entity == null) {
            return;
        }
        
        entity.setSubType(request.getSubType());
        entity.setQuantity(request.getQuantity());
        entity.setUnit(request.getUnit());
        entity.setEntryDate(request.getEntryDate());
        entity.setNotes(request.getNotes());
    }

    public CarbonEntryResponse toResponse(CarbonEntry entity) {
        if (entity == null) {
            return null;
        }

        return CarbonEntryResponse.builder()
                .id(entity.getId())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getCategoryId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
                .subType(entity.getSubType())
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .emissionKgco2e(entity.getEmissionKgco2e())
                .entryDate(entity.getEntryDate())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
