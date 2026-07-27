package com.ecotrack.challenge.repository;

import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.enums.ChallengeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    Page<Challenge> findByStatus(ChallengeStatus status, Pageable pageable);
    List<Challenge> findByStatusAndEndDateBefore(ChallengeStatus status, LocalDateTime dateTime);
    List<Challenge> findByStatusAndEndDateBetween(ChallengeStatus status, LocalDateTime start, LocalDateTime end);
}
