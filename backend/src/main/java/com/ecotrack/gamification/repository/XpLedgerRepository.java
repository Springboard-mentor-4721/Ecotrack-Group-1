package com.ecotrack.gamification.repository;

import com.ecotrack.gamification.entity.XpLedger;
import com.ecotrack.gamification.enums.XpSourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface XpLedgerRepository extends JpaRepository<XpLedger, Long> {

    org.springframework.data.domain.Page<XpLedger> findByUser_IdOrderByAwardedAtDesc(Long userId, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<XpLedger> findByUser_IdAndAwardedAtBetweenOrderByAwardedAtDesc(Long userId, LocalDateTime startDate, LocalDateTime endDate, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COALESCE(SUM(x.xpAwarded), 0) FROM XpLedger x WHERE x.user.id = :userId AND x.awardedAt BETWEEN :startDate AND :endDate")
    Long findSumByUserIdAndAwardedAtBetween(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    @Query("SELECT COALESCE(SUM(x.xpAwarded), 0) FROM XpLedger x WHERE x.user.id = :userId")
    Long findSumByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(x.xpAwarded), 0) FROM XpLedger x WHERE x.user.id = :userId AND x.sourceType = :sourceType")
    Long findSumByUserIdAndSourceType(@Param("userId") Long userId, @Param("sourceType") XpSourceType sourceType);


    Integer countByUser_IdAndSourceTypeAndAwardedAtAfter(Long userId, XpSourceType sourceType, LocalDateTime awardedAt);

    boolean existsByUser_IdAndSourceTypeAndSourceId(Long userId, XpSourceType sourceType, Long sourceId);

    @Query("SELECT x.user.id, x.user.name, SUM(x.xpAwarded) as totalXp " +
           "FROM XpLedger x WHERE x.awardedAt >= :startDate " +
           "GROUP BY x.user.id, x.user.name ORDER BY totalXp DESC")
    java.util.List<Object[]> findTopUsersByXpSince(@Param("startDate") LocalDateTime startDate, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COALESCE(SUM(x.xpAwarded), 0) FROM XpLedger x WHERE x.user.id = :userId AND x.awardedAt >= :startDate")
    Long findSumByUserIdAndAwardedAtAfter(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query(value = "SELECT COUNT(*) FROM (SELECT SUM(xp_awarded) as totalXp FROM xp_ledger WHERE awarded_at >= :startDate GROUP BY user_id HAVING SUM(xp_awarded) > :xp) as u", nativeQuery = true)
    Long countUsersWithXpGreaterThanSince(@Param("xp") Long xp, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(x.xpAwarded), 0) FROM XpLedger x WHERE x.user.id = :userId AND x.sourceType = :sourceType AND x.awardedAt BETWEEN :startDate AND :endDate")
    Long findSumByUserIdAndSourceTypeAndAwardedAtBetween(@Param("userId") Long userId, @Param("sourceType") XpSourceType sourceType, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

}
