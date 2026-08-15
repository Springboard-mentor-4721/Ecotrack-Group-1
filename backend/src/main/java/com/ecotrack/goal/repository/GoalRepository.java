package com.ecotrack.goal.repository;

import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.entity.enums.GoalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    Page<Goal> findByUserId(Long userId, Pageable pageable);

    Page<Goal> findByUserIdAndStatus(Long userId, GoalStatus status, Pageable pageable);

    Optional<Goal> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndStatus(Long userId, GoalStatus status);

    List<Goal> findByTargetDateBeforeAndStatus(LocalDate targetDate, GoalStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT g.status, COUNT(g) FROM Goal g WHERE g.user.id = :userId GROUP BY g.status")
    List<Object[]> getGoalStatusDistribution(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(g) FROM Goal g WHERE g.user.id = :userId AND g.status = com.ecotrack.goal.entity.enums.GoalStatus.ACHIEVED AND g.updatedAt >= :startDate AND g.updatedAt <= :endDate")
    long countCompletedByUserIdAndDateRange(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(g) FROM Goal g WHERE g.user.id = :userId AND g.status = com.ecotrack.goal.entity.enums.GoalStatus.ACTIVE AND g.createdAt <= :endDate AND g.targetDate >= :startDate")
    long countActiveByUserIdAndDateRange(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

}
