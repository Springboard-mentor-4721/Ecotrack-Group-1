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
}
