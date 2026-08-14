package com.ecotrack.gamification.repository;

import com.ecotrack.gamification.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.ecotrack.gamification.enums.BadgeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByCriteriaType(String criteriaType);
    Page<Badge> findByType(BadgeType type, Pageable pageable);
}
