package com.ecotrack.tracking.repository;

import com.ecotrack.tracking.entity.CarbonCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarbonCategoryRepository extends JpaRepository<CarbonCategory, Long> {
    Optional<CarbonCategory> findByName(String name);
    Optional<CarbonCategory> findByCode(String code);
    boolean existsByName(String name);
    List<CarbonCategory> findAllByOrderByNameAsc();
}
