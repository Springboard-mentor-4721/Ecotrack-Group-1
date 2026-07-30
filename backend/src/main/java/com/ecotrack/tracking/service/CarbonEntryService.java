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
import com.ecotrack.tracking.repository.CarbonSubCategoryRepository;
import com.ecotrack.tracking.repository.CarbonEntryRepository;
import com.ecotrack.tracking.repository.projection.CategoryEmissionProjection;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import com.ecotrack.event.CarbonEntryCreatedEvent;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.PageImpl;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarbonEntryService {

    private final CarbonEntryRepository carbonEntryRepository;
    private final CarbonSubCategoryRepository carbonSubCategoryRepository;
    private final UserRepository userRepository;
    private final EmissionCalculationService emissionCalculationService;
    private final CarbonEntryMapper carbonEntryMapper;
    private final EntityManager entityManager;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public CarbonEntryResponse createEntry(Long userId, CreateCarbonEntryRequest request) {
        log.info("Creating new carbon entry for user {}", userId);

        com.ecotrack.tracking.entity.CarbonSubCategory subCategory = carbonSubCategoryRepository.findById(request.getSubCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid subcategory"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        BigDecimal emissionKgco2e = emissionCalculationService.calculateEmission(
                subCategory,
                request.getQuantity()
        );

        CarbonEntry entity = carbonEntryMapper.toEntity(request);
        entity.setUser(user);
        entity.setSubCategory(subCategory);
        entity.setEmissionKgco2e(emissionKgco2e);
        entity.setNotes(normalizeNotes(request.getNotes()));

        CarbonEntry savedEntity = carbonEntryRepository.save(entity);
        eventPublisher.publishEvent(new CarbonEntryCreatedEvent(user.getId(), savedEntity.getId(), subCategory.getCategory().getCategoryId(), subCategory.getId(), request.getQuantity(), emissionKgco2e));
        return carbonEntryMapper.toResponse(savedEntity);
    }

    @Transactional
    public CarbonEntryResponse updateEntry(Long id, Long userId, UpdateCarbonEntryRequest request) {
        log.info("Updating carbon entry {} for user {}", id, userId);

        CarbonEntry entity = carbonEntryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(CarbonEntryNotFoundException::new);

        com.ecotrack.tracking.entity.CarbonSubCategory subCategory = carbonSubCategoryRepository.findById(request.getSubCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid subcategory"));

        BigDecimal emissionKgco2e = emissionCalculationService.calculateEmission(
                subCategory,
                request.getQuantity()
        );

        carbonEntryMapper.updateEntity(request, entity);
        entity.setSubCategory(subCategory);
        entity.setEmissionKgco2e(emissionKgco2e);
        entity.setNotes(normalizeNotes(request.getNotes()));

        CarbonEntry savedEntity = carbonEntryRepository.save(entity);
        return carbonEntryMapper.toResponse(savedEntity);
    }

    @Transactional
    public void deleteEntry(Long id, Long userId) {
        log.info("Deleting carbon entry {} for user {}", id, userId);

        CarbonEntry entity = carbonEntryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(CarbonEntryNotFoundException::new);

        carbonEntryRepository.delete(entity);
    }

    @Transactional(readOnly = true)
    public CarbonEntryResponse getEntryById(Long id, Long userId) {
        CarbonEntry entity = carbonEntryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(CarbonEntryNotFoundException::new);
        return carbonEntryMapper.toResponse(entity);
    }

    @Transactional(readOnly = true)
    public Page<CarbonEntryResponse> getUserEntries(Long userId, Long categoryId, Long subCategoryId, String search, LocalDate startDate, LocalDate endDate, java.math.BigDecimal emissionMin, java.math.BigDecimal emissionMax, java.math.BigDecimal quantityMin, java.math.BigDecimal quantityMax, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<CarbonEntry> cq = cb.createQuery(CarbonEntry.class);
        Root<CarbonEntry> root = cq.from(CarbonEntry.class);
        
        jakarta.persistence.criteria.Join<CarbonEntry, com.ecotrack.tracking.entity.CarbonSubCategory> subCategoryJoin = root.join("subCategory", jakarta.persistence.criteria.JoinType.LEFT);
        jakarta.persistence.criteria.Join<com.ecotrack.tracking.entity.CarbonSubCategory, CarbonCategory> categoryJoin = subCategoryJoin.join("category", jakarta.persistence.criteria.JoinType.LEFT);

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(root.get("user").get("id"), userId));

        if (categoryId != null) {
            predicates.add(cb.equal(categoryJoin.get("categoryId"), categoryId));
        }
        if (subCategoryId != null) {
            predicates.add(cb.equal(subCategoryJoin.get("id"), subCategoryId));
        }
        if (search != null && !search.trim().isEmpty()) {
            String likePattern = "%" + search.trim().toLowerCase() + "%";
            Predicate categoryMatch = cb.like(cb.lower(categoryJoin.get("name")), likePattern);
            Predicate subCategoryMatch = cb.like(cb.lower(subCategoryJoin.get("name")), likePattern);
            Predicate notesMatch = cb.like(cb.lower(root.get("notes")), likePattern);
            predicates.add(cb.or(categoryMatch, subCategoryMatch, notesMatch));
        }
        if (startDate != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("entryDate"), startDate.atStartOfDay()));
        }
        if (endDate != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("entryDate"), endDate.atTime(23, 59, 59)));
        }
        if (emissionMin != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("emissionKgco2e"), emissionMin));
        }
        if (emissionMax != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("emissionKgco2e"), emissionMax));
        }
        if (quantityMin != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("quantity"), quantityMin));
        }
        if (quantityMax != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("quantity"), quantityMax));
        }

        cq.where(predicates.toArray(new Predicate[0]));

        if (pageable.getSort().isSorted()) {
            List<jakarta.persistence.criteria.Order> orders = new ArrayList<>();
            for (org.springframework.data.domain.Sort.Order order : pageable.getSort()) {
                jakarta.persistence.criteria.Path<?> path = root;
                String property = order.getProperty();
                
                // Map frontend sort keys to backend paths if necessary
                if ("category".equals(property) || "category.name".equals(property)) {
                    path = categoryJoin.get("name");
                } else if ("subCategory".equals(property) || "subCategory.name".equals(property)) {
                    path = subCategoryJoin.get("name");
                } else if (property.contains(".")) {
                    for (String part : property.split("\\.")) {
                        path = path.get(part);
                    }
                } else {
                    path = root.get(property);
                }

                if (order.isAscending()) {
                    orders.add(cb.asc(path));
                } else {
                    orders.add(cb.desc(path));
                }
            }
            cq.orderBy(orders);
        }

        List<CarbonEntry> result = entityManager.createQuery(cq)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<CarbonEntry> countRoot = countQuery.from(CarbonEntry.class);
        jakarta.persistence.criteria.Join<CarbonEntry, com.ecotrack.tracking.entity.CarbonSubCategory> countSubCategoryJoin = countRoot.join("subCategory", jakarta.persistence.criteria.JoinType.LEFT);
        jakarta.persistence.criteria.Join<com.ecotrack.tracking.entity.CarbonSubCategory, CarbonCategory> countCategoryJoin = countSubCategoryJoin.join("category", jakarta.persistence.criteria.JoinType.LEFT);
        
        List<Predicate> countPredicates = new ArrayList<>();
        countPredicates.add(cb.equal(countRoot.get("user").get("id"), userId));
        if (categoryId != null) {
            countPredicates.add(cb.equal(countCategoryJoin.get("categoryId"), categoryId));
        }
        if (subCategoryId != null) {
            countPredicates.add(cb.equal(countSubCategoryJoin.get("id"), subCategoryId));
        }
        if (search != null && !search.trim().isEmpty()) {
            String likePattern = "%" + search.trim().toLowerCase() + "%";
            Predicate categoryMatch = cb.like(cb.lower(countCategoryJoin.get("name")), likePattern);
            Predicate subCategoryMatch = cb.like(cb.lower(countSubCategoryJoin.get("name")), likePattern);
            Predicate notesMatch = cb.like(cb.lower(countRoot.get("notes")), likePattern);
            countPredicates.add(cb.or(categoryMatch, subCategoryMatch, notesMatch));
        }
        if (startDate != null) {
            countPredicates.add(cb.greaterThanOrEqualTo(countRoot.get("entryDate"), startDate));
        }
        if (endDate != null) {
            countPredicates.add(cb.lessThanOrEqualTo(countRoot.get("entryDate"), endDate));
        }
        if (emissionMin != null) {
            countPredicates.add(cb.greaterThanOrEqualTo(countRoot.get("emissionKgco2e"), emissionMin));
        }
        if (emissionMax != null) {
            countPredicates.add(cb.lessThanOrEqualTo(countRoot.get("emissionKgco2e"), emissionMax));
        }
        if (quantityMin != null) {
            countPredicates.add(cb.greaterThanOrEqualTo(countRoot.get("quantity"), quantityMin));
        }
        if (quantityMax != null) {
            countPredicates.add(cb.lessThanOrEqualTo(countRoot.get("quantity"), quantityMax));
        }
        
        countQuery.select(cb.count(countRoot)).where(countPredicates.toArray(new Predicate[0]));
        Long count = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(result, pageable, count).map(carbonEntryMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public CarbonSummaryResponse getDashboardSummary(Long userId, LocalDate startDate, LocalDate endDate) {
        List<CategoryEmissionProjection> projections = carbonEntryRepository.getEmissionSummaryByUserAndDateRange(userId, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));

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

        long totalEntries = carbonEntryRepository.countByUserIdAndEntryDateBetween(userId, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));

        List<com.ecotrack.tracking.repository.projection.DailyEmissionProjection> dailyProjections = carbonEntryRepository.getDailyEmissionSummary(userId, startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        
        List<com.ecotrack.tracking.dto.DailyEmissionResponse> weeklyTrend = dailyProjections.stream()
                .map(proj -> com.ecotrack.tracking.dto.DailyEmissionResponse.builder()
                        .date(proj.getDate())
                        .totalEmission(proj.getTotalEmission())
                        .build())
                .collect(Collectors.toList());

        return CarbonSummaryResponse.builder()
                .totalEmission(grandTotal)
                .totalEntriesCount(totalEntries)
                .categorySummaries(categorySummaries)
                .weeklyTrend(weeklyTrend)
                .build();
    }

    private void enforceSameDayEditRule(LocalDateTime entryDate) {
        if (entryDate.toLocalDate().isBefore(LocalDate.now())) {
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


