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

    @Query("SELECT COALESCE(SUM(x.xpAwarded), 0) FROM XpLedger x WHERE x.user.id = :userId")
    Long findSumByUserId(@Param("userId") Long userId);

    Integer countByUser_IdAndSourceTypeAndAwardedAtAfter(Long userId, XpSourceType sourceType, LocalDateTime awardedAt);
}
