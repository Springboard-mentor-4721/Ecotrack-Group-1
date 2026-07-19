package com.ecotrack.tracking.service;

import com.ecotrack.tracking.entity.CarbonSubCategory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmissionCalculationService {

    /**
     * Calculates the total emission using the subcategory's factor.
     */
    public BigDecimal calculateEmission(CarbonSubCategory subCategory, BigDecimal quantity) {
        BigDecimal emission = quantity.multiply(subCategory.getEmissionFactor());
        return emission.setScale(4, RoundingMode.HALF_UP);
    }
}
