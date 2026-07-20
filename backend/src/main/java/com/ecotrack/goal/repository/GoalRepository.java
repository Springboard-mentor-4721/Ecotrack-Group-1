package com.ecotrack.goal.repository;

import com.ecotrack.goal.entity.Goal;
import com.ecotrack.goal.entity.enums.GoalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    Page<Goal> findByUserId(Long userId, Pageable pageable);

    long countByUserIdAndStatus(Long userId, GoalStatus status);

    List<Goal> findByTargetDateBeforeAndStatus(LocalDate targetDate, GoalStatus status);
}
