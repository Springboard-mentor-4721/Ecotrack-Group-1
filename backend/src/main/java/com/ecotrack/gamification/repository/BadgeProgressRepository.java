package com.ecotrack.gamification.repository;

import com.ecotrack.gamification.entity.BadgeProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface BadgeProgressRepository extends JpaRepository<BadgeProgress, Long> {
    Optional<BadgeProgress> findByUserIdAndBadgeId(Long userId, Long badgeId);
    List<BadgeProgress> findByUserId(Long userId);
}
