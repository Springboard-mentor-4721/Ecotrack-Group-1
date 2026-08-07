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
    
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.QueryHints({@jakarta.persistence.QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")})
    @org.springframework.data.jpa.repository.Query("SELECT cp FROM ChallengeParticipant cp WHERE cp.challenge.id = :challengeId AND cp.userId = :userId")
    Optional<ChallengeParticipant> findByChallengeIdAndUserIdForUpdate(@org.springframework.data.repository.query.Param("challengeId") Long challengeId, @org.springframework.data.repository.query.Param("userId") Long userId);

    List<ChallengeParticipant> findByUserIdAndStatus(Long userId, ChallengeParticipantStatus status);
    List<ChallengeParticipant> findByUserIdAndStatusIn(Long userId, List<ChallengeParticipantStatus> statuses);
    Page<ChallengeParticipant> findByUserId(Long userId, Pageable pageable);
    long countByChallengeId(Long challengeId);
    List<ChallengeParticipant> findByChallengeId(Long challengeId);
    Page<ChallengeParticipant> findByChallengeId(Long challengeId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT cp.challenge.id, COUNT(cp) FROM ChallengeParticipant cp WHERE cp.challenge.id IN :challengeIds GROUP BY cp.challenge.id")
    List<Object[]> countParticipantsByChallengeIds(@org.springframework.data.repository.query.Param("challengeIds") List<Long> challengeIds);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(cp.challenge.rewardXp), 0) FROM ChallengeParticipant cp WHERE cp.status = 'COMPLETED'")
    long sumTotalXpDistributed();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT cp.userId) FROM ChallengeParticipant cp")
    long countDistinctUsers();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(cp.challenge.targetValue), 0.0) FROM ChallengeParticipant cp WHERE cp.status = 'COMPLETED' AND cp.challenge.typeCode = 'REDUCE_CO2'")
    double sumTotalCo2Impact();
    
    @org.springframework.data.jpa.repository.Query(
        value = "SELECT DATE_FORMAT(joined_at, '%Y-%m') as monthStr, COUNT(*) FROM challenge_participants GROUP BY monthStr", 
        nativeQuery = true
    )
    List<Object[]> countParticipationByMonth();
}
