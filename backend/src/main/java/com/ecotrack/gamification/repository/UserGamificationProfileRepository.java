package com.ecotrack.gamification.repository;

import com.ecotrack.gamification.entity.UserGamificationProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserGamificationProfileRepository extends JpaRepository<UserGamificationProfile, Long> {
    Optional<UserGamificationProfile> findByUserId(Long userId);
}
