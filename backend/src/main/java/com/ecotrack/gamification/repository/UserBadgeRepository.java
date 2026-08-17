package com.ecotrack.gamification.repository;

import com.ecotrack.gamification.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserId(Long userId);
    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);

    // --- Admin Analytics Aggregations ---

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(ub) FROM UserBadge ub WHERE ub.awardedAt >= :startDate AND ub.awardedAt < :endDate")
    long countAwardedInPeriod(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT new com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO(ub.badge.name, CAST(COUNT(ub) AS double)) FROM UserBadge ub GROUP BY ub.badge.name ORDER BY COUNT(ub) DESC")
    java.util.List<com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO> getBadgeAwardDistribution();

    @org.springframework.data.jpa.repository.Query("SELECT new com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO(CAST(ub.badge.type AS string), CAST(COUNT(ub) AS double)) FROM UserBadge ub GROUP BY ub.badge.type")
    java.util.List<com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO> getBadgeTypeDistribution();
}
