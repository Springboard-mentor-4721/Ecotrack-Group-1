package com.ecotrack.tracking.repository;

import com.ecotrack.tracking.entity.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {

    @Query("SELECT e FROM EmissionFactor e " +
           "WHERE e.category.categoryId = :categoryId " +
           "AND e.unit = :unit " +
           "AND e.effectiveFrom <= :entryDate " +
           "AND (e.effectiveTo IS NULL OR e.effectiveTo >= :entryDate)")
    Optional<EmissionFactor> findActiveFactorForDate(
            @Param("categoryId") Long categoryId,
            @Param("unit") String unit,
            @Param("entryDate") LocalDate entryDate);
}
