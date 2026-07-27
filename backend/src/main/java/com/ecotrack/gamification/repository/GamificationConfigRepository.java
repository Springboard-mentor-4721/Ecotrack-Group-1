package com.ecotrack.gamification.repository;

import com.ecotrack.gamification.entity.GamificationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GamificationConfigRepository extends JpaRepository<GamificationConfig, String> {
}
