package com.ecotrack.gamification.repository;

import com.ecotrack.gamification.entity.UserGamificationProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserGamificationProfileRepository extends JpaRepository<UserGamificationProfile, Long> {
    Optional<UserGamificationProfile> findByUserId(Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT p FROM UserGamificationProfile p WHERE p.userId IN (SELECT u.id FROM User u WHERE u.role = 'USER') ORDER BY p.lifetimeEcoXp DESC LIMIT 50")
    java.util.List<UserGamificationProfile> findTop50ByOrderByLifetimeEcoXpDesc();
    
    @org.springframework.data.jpa.repository.Query("SELECT p FROM UserGamificationProfile p WHERE p.userId IN (SELECT u.id FROM User u WHERE u.role = 'USER') ORDER BY p.currentEcoScore DESC LIMIT 50")
    java.util.List<UserGamificationProfile> findTop50ByOrderByCurrentEcoScoreDesc();
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM UserGamificationProfile p WHERE p.lifetimeEcoXp > :lifetimeEcoXp AND p.userId IN (SELECT u.id FROM User u WHERE u.role = 'USER')")
    long countByLifetimeEcoXpGreaterThan(Long lifetimeEcoXp);
    
    @org.springframework.data.jpa.repository.Query("SELECT MIN(p.lifetimeEcoXp) FROM UserGamificationProfile p WHERE p.lifetimeEcoXp > :xp AND p.userId IN (SELECT u.id FROM User u WHERE u.role = 'USER')")
    Optional<Long> findLowestXpGreaterThan(@org.springframework.data.repository.query.Param("xp") Long xp);
    
    java.util.List<UserGamificationProfile> findTop500ByLastActivityDateBeforeAndUserIdGreaterThanOrderByUserIdAsc(java.time.LocalDate threshold, Long lastId);
    
    @org.springframework.data.jpa.repository.Query("SELECT p FROM UserGamificationProfile p WHERE p.userId IN (SELECT u.id FROM User u WHERE u.role = 'USER') ORDER BY p.lifetimeEcoXp DESC")
    org.springframework.data.domain.Page<UserGamificationProfile> findAllByOrderByLifetimeEcoXpDesc(org.springframework.data.domain.Pageable pageable);
    
    @org.springframework.data.jpa.repository.Query("SELECT p FROM UserGamificationProfile p WHERE p.userId IN (SELECT u.id FROM User u WHERE u.role = 'USER') ORDER BY p.currentEcoScore DESC")
    org.springframework.data.domain.Page<UserGamificationProfile> findAllByOrderByCurrentEcoScoreDesc(org.springframework.data.domain.Pageable pageable);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM UserGamificationProfile p WHERE p.currentEcoScore > :ecoScore AND p.userId IN (SELECT u.id FROM User u WHERE u.role = 'USER')")
    long countByCurrentEcoScoreGreaterThan(java.math.BigDecimal ecoScore);
    
    @org.springframework.data.jpa.repository.Query("SELECT MIN(p.currentEcoScore) FROM UserGamificationProfile p WHERE p.currentEcoScore > :score")
    Optional<java.math.BigDecimal> findLowestEcoScoreGreaterThan(@org.springframework.data.repository.query.Param("score") java.math.BigDecimal score);

    // --- Admin Analytics Aggregations ---

    @org.springframework.data.jpa.repository.Query("SELECT new com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO(CAST(p.currentLevel AS string), CAST(COUNT(p) AS double)) FROM UserGamificationProfile p GROUP BY CAST(p.currentLevel AS string)")
    java.util.List<com.ecotrack.admin.dto.analytics.AnalyticsDistributionDTO> getLevelDistribution();

    @org.springframework.data.jpa.repository.Query("SELECT AVG(p.currentEcoScore) FROM UserGamificationProfile p")
    Double getAverageEcoScore();
}
