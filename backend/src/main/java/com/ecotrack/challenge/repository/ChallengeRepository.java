package com.ecotrack.challenge.repository;

import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.enums.ChallengeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long>, JpaSpecificationExecutor<Challenge> {
    Page<Challenge> findByStatus(ChallengeStatus status, Pageable pageable);
    long countByStatus(ChallengeStatus status);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Challenge c SET c.globalProgress = CASE WHEN (c.globalProgress + :delta) < 0 THEN 0 ELSE (c.globalProgress + :delta) END WHERE c.id = :id")
    void incrementGlobalProgress(@org.springframework.data.repository.query.Param("id") Long id, @org.springframework.data.repository.query.Param("delta") java.math.BigDecimal delta);
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Challenge c WHERE c.status = :status AND c.id NOT IN (SELECT p.challenge.id FROM ChallengeParticipant p WHERE p.userId = :userId)")
    Page<Challenge> findExploreChallenges(@org.springframework.data.repository.query.Param("status") ChallengeStatus status, @org.springframework.data.repository.query.Param("userId") Long userId, Pageable pageable);
    
    @org.springframework.data.jpa.repository.Query("""
        SELECT c.status, COUNT(c)
        FROM Challenge c
        GROUP BY c.status
    """)
    List<Object[]> countChallengesByStatus();
    
    List<Challenge> findByStatusAndEndDateBefore(ChallengeStatus status, LocalDateTime dateTime);
    List<Challenge> findByStatusAndStartDateBefore(ChallengeStatus status, LocalDateTime dateTime);
    List<Challenge> findByStatusAndEndDateBetween(ChallengeStatus status, LocalDateTime start, LocalDateTime end);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // --- Admin Analytics Aggregations ---

    @org.springframework.data.jpa.repository.Query("SELECT new com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO(CAST(c.status AS string), CAST(COUNT(c) AS double)) FROM Challenge c GROUP BY CAST(c.status AS string)")
    java.util.List<com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO> getStatusDistribution();

    @org.springframework.data.jpa.repository.Query("SELECT new com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO(cat.name, CAST(COUNT(c) AS double)) FROM Challenge c JOIN com.ecotrack.tracking.entity.CarbonCategory cat ON c.linkedCategoryId = cat.id GROUP BY cat.name")
    java.util.List<com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO> getCategoryDistribution();
}
