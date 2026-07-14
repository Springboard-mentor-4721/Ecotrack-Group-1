package com.ecotrack.tracking.service;

import com.ecotrack.tracking.dto.CarbonEntryResponse;
import com.ecotrack.tracking.dto.CarbonSummaryResponse;
import com.ecotrack.tracking.dto.CategoryEmissionResponse;
import com.ecotrack.tracking.dto.CreateCarbonEntryRequest;
import com.ecotrack.tracking.dto.UpdateCarbonEntryRequest;
import com.ecotrack.tracking.entity.CarbonCategory;
import com.ecotrack.tracking.entity.CarbonEntry;
import com.ecotrack.user.entity.User;
import com.ecotrack.tracking.exception.CarbonEntryNotFoundException;
import com.ecotrack.tracking.exception.EntryModificationNotAllowedException;
import com.ecotrack.tracking.exception.InvalidCarbonCategoryException;
import com.ecotrack.tracking.mapper.CarbonEntryMapper;
import com.ecotrack.tracking.repository.CarbonCategoryRepository;
import com.ecotrack.tracking.repository.CarbonEntryRepository;
import com.ecotrack.tracking.repository.projection.CategoryEmissionProjection;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarbonEntryService {

    private final CarbonEntryRepository carbonEntryRepository;
    private final CarbonCategoryRepository carbonCategoryRepository;
    private final UserRepository userRepository;
    private final EmissionCalculationService emissionCalculationService;
    private final CarbonEntryMapper carbonEntryMapper;

    @Transactional
    public CarbonEntryResponse createEntry(Long userId, CreateCarbonEntryRequest request) {
        log.info("Creating new carbon entry for user {}", userId);

        CarbonCategory category = carbonCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(InvalidCarbonCategoryException::new);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        BigDecimal emissionKgco2e = emissionCalculationService.calculateEmission(
                category,
                request.getUnit(),
                request.getQuantity(),
                request.getEntryDate()
        );

        CarbonEntry entity = carbonEntryMapper.toEntity(request);
        entity.setUser(user);
        entity.setCategory(category);
        entity.setEmissionKgco2e(emissionKgco2e);
        entity.setUnit(normalizeString(request.getUnit()));
        entity.setNotes(normalizeNotes(request.getNotes()));

        CarbonEntry savedEntity = carbonEntryRepository.save(entity);
        return carbonEntryMapper.toResponse(savedEntity);
    }

    @Transactional
    public CarbonEntryResponse updateEntry(Long id, Long userId, UpdateCarbonEntryRequest request) {
        log.info("Updating carbon entry {} for user {}", id, userId);

        CarbonEntry entity = carbonEntryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(CarbonEntryNotFoundException::new);

        enforceSameDayEditRule(entity.getEntryDate());

        CarbonCategory category = carbonCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(InvalidCarbonCategoryException::new);

        BigDecimal emissionKgco2e = emissionCalculationService.calculateEmission(
                category,
                request.getUnit(),
                request.getQuantity(),
                request.getEntryDate()
        );

        carbonEntryMapper.updateEntity(request, entity);
        entity.setCategory(category);
        entity.setEmissionKgco2e(emissionKgco2e);
        entity.setUnit(normalizeString(request.getUnit()));
        entity.setNotes(normalizeNotes(request.getNotes()));

        CarbonEntry savedEntity = carbonEntryRepository.save(entity);
        return carbonEntryMapper.toResponse(savedEntity);
    }

    @Transactional
    public void deleteEntry(Long id, Long userId) {
        log.info("Deleting carbon entry {} for user {}", id, userId);

        CarbonEntry entity = carbonEntryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(CarbonEntryNotFoundException::new);

        enforceSameDayEditRule(entity.getEntryDate());

        carbonEntryRepository.delete(entity);
    }

    @Transactional(readOnly = true)
    public CarbonEntryResponse getEntryById(Long id, Long userId) {
        CarbonEntry entity = carbonEntryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(CarbonEntryNotFoundException::new);
        return carbonEntryMapper.toResponse(entity);
    }

    @Transactional(readOnly = true)
    public Page<CarbonEntryResponse> getUserEntries(Long userId, Pageable pageable) {
        return carbonEntryRepository.findByUserId(userId, pageable)
                .map(carbonEntryMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public CarbonSummaryResponse getDashboardSummary(Long userId, LocalDate startDate, LocalDate endDate) {
        List<CategoryEmissionProjection> projections = 
                carbonEntryRepository.getEmissionSummaryByUserAndDateRange(userId, startDate, endDate);

        BigDecimal grandTotal = projections.stream()
                .map(CategoryEmissionProjection::getTotalEmission)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategoryEmissionResponse> categorySummaries = projections.stream()
                .map(proj -> {
                    BigDecimal percentage = BigDecimal.ZERO;
                    if (grandTotal.compareTo(BigDecimal.ZERO) > 0) {
                        percentage = proj.getTotalEmission()
                                .divide(grandTotal, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .setScale(1, RoundingMode.HALF_UP);
                    }

                    return CategoryEmissionResponse.builder()
                            .categoryName(proj.getCategoryName())
                            .totalEmission(proj.getTotalEmission())
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());

        return CarbonSummaryResponse.builder()
                .totalEmission(grandTotal)
                .categorySummaries(categorySummaries)
                .build();
    }

    private void enforceSameDayEditRule(LocalDate entryDate) {
        if (entryDate.isBefore(LocalDate.now())) {
            throw new EntryModificationNotAllowedException();
        }
    }
    
    private String normalizeString(String val) {
        return val != null ? val.trim().toLowerCase() : null;
    }

    private String normalizeNotes(String notes) {
        if (notes == null) return null;
        String trimmed = notes.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
