package com.ecotrack.gamification.repository;

import com.ecotrack.gamification.entity.UserGamificationProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserGamificationProfileRepository extends JpaRepository<UserGamificationProfile, Long> {
    Optional<UserGamificationProfile> findByUserId(Long userId);
    
    java.util.List<UserGamificationProfile> findTop50ByOrderByLifetimeEcoXpDesc();
    java.util.List<UserGamificationProfile> findTop50ByOrderByCurrentEcoScoreDesc();
    long countByLifetimeEcoXpGreaterThan(Long lifetimeEcoXp);
    
    @org.springframework.data.jpa.repository.Query("SELECT MIN(p.lifetimeEcoXp) FROM UserGamificationProfile p WHERE p.lifetimeEcoXp > :xp")
    Optional<Long> findLowestXpGreaterThan(@org.springframework.data.repository.query.Param("xp") Long xp);
    
    java.util.List<UserGamificationProfile> findTop500ByLastActivityDateBeforeAndUserIdGreaterThanOrderByUserIdAsc(java.time.LocalDate threshold, Long lastId);
}
