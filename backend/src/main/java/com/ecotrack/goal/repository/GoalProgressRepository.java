package com.ecotrack.goal.repository;

import com.ecotrack.goal.entity.GoalProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalProgressRepository extends JpaRepository<GoalProgress, Long> {

    List<GoalProgress> findByGoalIdOrderByRecordedAtDesc(Long goalId);

    @org.springframework.data.jpa.repository.Query("SELECT gp.goal.id AS goalId, SUM(gp.progressValue) AS totalProgress " +
           "FROM GoalProgress gp " +
           "WHERE gp.goal.id IN :goalIds " +
           "GROUP BY gp.goal.id")
    List<com.ecotrack.goal.repository.projection.GoalProgressBulkProjection> sumProgressByGoalIds(@org.springframework.data.repository.query.Param("goalIds") List<Long> goalIds);
}
