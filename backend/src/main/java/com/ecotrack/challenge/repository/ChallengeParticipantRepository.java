package com.ecotrack.challenge.repository;

import com.ecotrack.challenge.entity.ChallengeParticipant;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeParticipantRepository extends JpaRepository<ChallengeParticipant, Long> {
    Optional<ChallengeParticipant> findByChallengeIdAndUserId(Long challengeId, Long userId);
    List<ChallengeParticipant> findByUserIdAndStatus(Long userId, ChallengeParticipantStatus status);
    Page<ChallengeParticipant> findByUserId(Long userId, Pageable pageable);
    List<ChallengeParticipant> findByChallengeId(Long challengeId);
}
