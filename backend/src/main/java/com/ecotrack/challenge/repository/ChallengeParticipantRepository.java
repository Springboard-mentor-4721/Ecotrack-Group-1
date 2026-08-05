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
    long countByChallengeId(Long challengeId);
    List<ChallengeParticipant> findByChallengeId(Long challengeId);
    Page<ChallengeParticipant> findByChallengeId(Long challengeId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(cp.challenge.rewardXp), 0) FROM ChallengeParticipant cp WHERE cp.status = 'COMPLETED'")
    long sumTotalXpDistributed();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT cp.userId) FROM ChallengeParticipant cp")
    long countDistinctUsers();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(cp.challenge.targetValue), 0.0) FROM ChallengeParticipant cp WHERE cp.status = 'COMPLETED' AND cp.challenge.typeCode = 'REDUCE_CO2'")
    double sumTotalCo2Impact();
}
