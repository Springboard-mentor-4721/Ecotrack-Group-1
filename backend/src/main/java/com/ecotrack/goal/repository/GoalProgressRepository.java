package com.ecotrack.goal.repository;

import com.ecotrack.goal.entity.GoalProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalProgressRepository extends JpaRepository<GoalProgress, Long> {

    List<GoalProgress> findByGoalIdOrderByRecordedAtDesc(Long goalId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(gp.progressValue), 0) FROM GoalProgress gp WHERE gp.goal.id = :goalId")
    java.math.BigDecimal sumTotalProgressByGoalId(@org.springframework.data.repository.query.Param("goalId") Long goalId);

    @org.springframework.data.jpa.repository.Query("SELECT gp.goal.id AS goalId, SUM(gp.progressValue) AS totalProgress " +
           "FROM GoalProgress gp " +
           "WHERE gp.goal.id IN :goalIds " +
           "GROUP BY gp.goal.id")
    List<com.ecotrack.goal.repository.projection.GoalProgressBulkProjection> sumProgressByGoalIds(@org.springframework.data.repository.query.Param("goalIds") List<Long> goalIds);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(gp.progressValue), 0) " +
           "FROM GoalProgress gp " +
           "WHERE gp.goal.id = :goalId " +
           "AND gp.recordedAt BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumProgressByGoalIdAndDateRange(
           @org.springframework.data.repository.query.Param("goalId") Long goalId,
           @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
           @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(gp.progressValue), 0) FROM GoalProgress gp WHERE gp.goal.user.id = :userId AND gp.recordedAt BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumProgressByUserIdAndDateRange(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT DATE(gp.recordedAt) AS date, SUM(gp.progressValue) AS totalProgress " +
           "FROM GoalProgress gp " +
           "WHERE gp.goal.user.id = :userId " +
           "AND gp.recordedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(gp.recordedAt) " +
           "ORDER BY DATE(gp.recordedAt) ASC")
    List<com.ecotrack.goal.repository.projection.DailyProgressProjection> getDailyProgressSummary(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT YEAR(gp.recordedAt) AS year, MONTH(gp.recordedAt) AS month, SUM(gp.progressValue) AS totalProgress " +
           "FROM GoalProgress gp " +
           "WHERE gp.goal.user.id = :userId " +
           "AND gp.recordedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY YEAR(gp.recordedAt), MONTH(gp.recordedAt) " +
           "ORDER BY YEAR(gp.recordedAt) ASC, MONTH(gp.recordedAt) ASC")
    List<com.ecotrack.goal.repository.projection.MonthlyProgressProjection> getMonthlyProgressSummary(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

}
