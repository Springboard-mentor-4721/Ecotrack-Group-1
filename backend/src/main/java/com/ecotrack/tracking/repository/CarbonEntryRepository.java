package com.ecotrack.tracking.repository;

import com.ecotrack.tracking.entity.CarbonEntry;
import com.ecotrack.tracking.repository.projection.CategoryEmissionProjection;
import com.ecotrack.tracking.repository.projection.DailyEmissionProjection;
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

    long countByUserIdAndEntryDateBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);


    @Query("SELECT c.subCategory.category.name AS categoryName, SUM(c.emissionKgco2e) AS totalEmission " +
           "FROM CarbonEntry c " +
           "WHERE c.user.id = :userId " +
           "AND c.entryDate BETWEEN :startDate AND :endDate " +
           "GROUP BY c.subCategory.category.name")
    List<CategoryEmissionProjection> getEmissionSummaryByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT DATE(c.entryDate) AS date, SUM(c.emissionKgco2e) AS totalEmission " +
           "FROM CarbonEntry c " +
           "WHERE c.user.id = :userId " +
           "AND c.entryDate BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(c.entryDate) " +
           "ORDER BY DATE(c.entryDate) ASC")
    List<DailyEmissionProjection> getDailyEmissionSummary(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT c.subCategory.category.code AS categoryCode, SUM(c.emissionKgco2e) AS totalVolume, COUNT(c.id) AS entryCount " +
           "FROM CarbonEntry c " +
           "WHERE c.user.id = :userId " +
           "AND c.entryDate >= :startDate " +
           "GROUP BY c.subCategory.category.code " +
           "ORDER BY totalVolume DESC")
    List<com.ecotrack.recommendation.dto.CategorySummaryProjection> getCategorySummaries(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate);

    @Query("SELECT c.subCategory.category.code AS categoryCode, c.subCategory.name AS subCategoryName, SUM(c.emissionKgco2e) AS totalValue " +
           "FROM CarbonEntry c " +
           "WHERE c.user.id = :userId " +
           "AND c.entryDate >= :startDate " +
           "GROUP BY c.subCategory.category.code, c.subCategory.name " +
           "ORDER BY totalValue DESC")
    List<com.ecotrack.tracking.repository.projection.SubCategoryVolumeProjection> getTopSubCategoriesByVolume(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            Pageable pageable);

    @Query("SELECT c.subCategory.category.code AS categoryCode, c.subCategory.name AS subCategoryName, COUNT(c.id) AS totalValue " +
           "FROM CarbonEntry c " +
           "WHERE c.user.id = :userId " +
           "AND c.entryDate >= :startDate " +
           "GROUP BY c.subCategory.category.code, c.subCategory.name " +
           "ORDER BY totalValue DESC")
    List<com.ecotrack.tracking.repository.projection.SubCategoryVolumeProjection> getTopSubCategoriesByFrequency(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            Pageable pageable);

    @Query("SELECT c FROM CarbonEntry c JOIN FETCH c.subCategory sc JOIN FETCH sc.category cat " +
           "WHERE c.user.id = :userId AND c.entryDate BETWEEN :startDate AND :endDate")
    List<CarbonEntry> findAllWithCategoriesByUserIdAndDateRange(
            @Param("userId") Long userId, 
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate);
    @Query("SELECT YEAR(c.entryDate) AS year, MONTH(c.entryDate) AS month, SUM(c.emissionKgco2e) AS totalEmission " +
           "FROM CarbonEntry c " +
           "WHERE c.user.id = :userId " +
           "AND c.entryDate BETWEEN :startDate AND :endDate " +
           "GROUP BY YEAR(c.entryDate), MONTH(c.entryDate) " +
           "ORDER BY YEAR(c.entryDate) ASC, MONTH(c.entryDate) ASC")
    List<com.ecotrack.tracking.repository.projection.MonthlyEmissionProjection> getMonthlyEmissionSummary(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    List<CarbonEntry> findTop5ByUserIdOrderByEntryDateDesc(Long userId);
}
