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
    @org.springframework.data.jpa.repository.QueryHints({@jakarta.persistence.QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")
})
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

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(cp.challenge.rewardXp), 0) FROM ChallengeParticipant cp WHERE cp.status = 'COMPLETED' AND cp.userId IN (SELECT u.id FROM User u WHERE u.role = 'USER')")
    long sumTotalXpDistributed();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT cp.userId) FROM ChallengeParticipant cp WHERE cp.userId IN (SELECT u.id FROM User u WHERE u.role = 'USER')")
    long countDistinctUsers();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(CASE WHEN cp.challenge.challengeEvaluationType = com.ecotrack.challenge.enums.ChallengeEvaluationType.BUDGET THEN (cp.challenge.targetValue - cp.progress) ELSE cp.progress END), 0.0) FROM ChallengeParticipant cp WHERE cp.status = 'COMPLETED' AND cp.challenge.progressMetric = com.ecotrack.challenge.enums.ProgressMetric.CARBON_EMISSION AND cp.userId IN (SELECT u.id FROM User u WHERE u.role = 'USER')")
    double sumTotalCo2Impact();
    
    @org.springframework.data.jpa.repository.Query(
        value = "SELECT DATE_FORMAT(cp.joined_at, '%Y-%m') as monthStr, COUNT(*) FROM challenge_participants cp JOIN users u ON cp.user_id = u.id WHERE u.role = 'USER' GROUP BY monthStr", 
        nativeQuery = true
    )
    List<Object[]> countParticipationByMonth();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(cp) FROM ChallengeParticipant cp WHERE cp.userId = :userId AND cp.joinedAt BETWEEN :startDate AND :endDate")
    long countParticipatedByUserIdAndDateRange(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(cp) FROM ChallengeParticipant cp WHERE cp.joinedAt >= :startDate AND cp.joinedAt < :endDate")
    long countParticipantsInPeriod(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(cp) FROM ChallengeParticipant cp WHERE cp.userId = :userId AND cp.status = com.ecotrack.challenge.enums.ChallengeParticipantStatus.COMPLETED AND cp.completedAt BETWEEN :startDate AND :endDate")
    long countCompletedByUserIdAndDateRange(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT cp.status, COUNT(cp) FROM ChallengeParticipant cp WHERE cp.userId = :userId GROUP BY cp.status")
    java.util.List<Object[]> getParticipantStatusDistribution(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT DATE(cp.completedAt) AS date, COUNT(cp) AS count " +
           "FROM ChallengeParticipant cp " +
           "WHERE cp.userId = :userId " +
           "AND cp.status = com.ecotrack.challenge.enums.ChallengeParticipantStatus.COMPLETED " +
           "AND cp.completedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(cp.completedAt) " +
           "ORDER BY DATE(cp.completedAt) ASC")
    java.util.List<com.ecotrack.challenge.repository.projection.DailyCompletionProjection> getDailyCompletionTrend(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT YEAR(cp.completedAt) AS year, MONTH(cp.completedAt) AS month, COUNT(cp) AS count " +
           "FROM ChallengeParticipant cp " +
           "WHERE cp.userId = :userId " +
           "AND cp.status = com.ecotrack.challenge.enums.ChallengeParticipantStatus.COMPLETED " +
           "AND cp.completedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY YEAR(cp.completedAt), MONTH(cp.completedAt) " +
           "ORDER BY YEAR(cp.completedAt) ASC, MONTH(cp.completedAt) ASC")
    java.util.List<com.ecotrack.challenge.repository.projection.MonthlyCompletionProjection> getMonthlyCompletionTrend(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

}
