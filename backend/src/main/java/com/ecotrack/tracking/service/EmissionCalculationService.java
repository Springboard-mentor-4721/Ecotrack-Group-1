package com.ecotrack.tracking.service;

import com.ecotrack.tracking.entity.CarbonCategory;
import com.ecotrack.tracking.entity.EmissionFactor;
import com.ecotrack.tracking.exception.EmissionFactorNotFoundException;
import com.ecotrack.tracking.repository.EmissionFactorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmissionCalculationService {

    private final EmissionFactorRepository emissionFactorRepository;

    /**
     * Resolves the active emission factor and calculates the total emission.
     */
    public BigDecimal calculateEmission(CarbonCategory category, String unit, BigDecimal quantity, LocalDate entryDate) {
        String normalizedUnit = unit != null ? unit.trim().toLowerCase() : null;

        EmissionFactor factor = emissionFactorRepository.findActiveFactorForDate(
                        category.getCategoryId(),
                        normalizedUnit,
                        entryDate)
                .orElseThrow(EmissionFactorNotFoundException::new);

        BigDecimal emission = quantity.multiply(factor.getFactorValue());
        
        return emission.setScale(4, RoundingMode.HALF_UP);
    }
}
