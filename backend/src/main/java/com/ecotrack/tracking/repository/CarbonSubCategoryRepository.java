package com.ecotrack.tracking.repository;

import com.ecotrack.tracking.entity.CarbonSubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarbonSubCategoryRepository extends JpaRepository<CarbonSubCategory, Long> {
    List<CarbonSubCategory> findByCategory_CategoryId(Long categoryId);
}
