package com.ecotrack.goal.repository;

import com.ecotrack.goal.entity.GoalProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalProgressRepository extends JpaRepository<GoalProgress, Long> {

    List<GoalProgress> findByGoalIdOrderByRecordedAtDesc(Long goalId);
}
