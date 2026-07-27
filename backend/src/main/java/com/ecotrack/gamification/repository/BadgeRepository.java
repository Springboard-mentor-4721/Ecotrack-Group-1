package com.ecotrack.gamification.repository;

import com.ecotrack.gamification.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByCriteriaType(String criteriaType);
}
