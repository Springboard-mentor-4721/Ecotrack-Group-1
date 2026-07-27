package com.ecotrack.recommendation.repository;

import com.ecotrack.recommendation.entity.Recommendation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    Page<Recommendation> findByUserId(Long userId, Pageable pageable);
    
    // For weekly scheduler
    // Finds users who haven't had recommendations generated since a specific date
    // Actually simpler to check the latest recommendation per user, or use a custom query
    List<Recommendation> findByUserIdAndCreatedAtAfter(Long userId, LocalDateTime date);
}
