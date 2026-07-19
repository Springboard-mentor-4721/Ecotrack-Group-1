package com.ecotrack.tracking.repository;

import com.ecotrack.tracking.entity.CarbonEntry;
import com.ecotrack.tracking.repository.projection.CategoryEmissionProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarbonEntryRepository extends JpaRepository<CarbonEntry, Long> {

    Optional<CarbonEntry> findByIdAndUserId(Long id, Long userId);

    Page<CarbonEntry> findByUserId(Long userId, Pageable pageable);

    Page<CarbonEntry> findByUserIdAndEntryDateBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);


    @Query("SELECT c.subCategory.category.name AS categoryName, SUM(c.emissionKgco2e) AS totalEmission " +
           "FROM CarbonEntry c " +
           "WHERE c.user.id = :userId " +
           "AND c.entryDate BETWEEN :startDate AND :endDate " +
           "GROUP BY c.subCategory.category.name")
    List<CategoryEmissionProjection> getEmissionSummaryByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
