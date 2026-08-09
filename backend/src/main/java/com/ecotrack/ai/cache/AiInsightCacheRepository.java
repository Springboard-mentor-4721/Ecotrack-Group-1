package com.ecotrack.ai.cache;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AiInsightCacheRepository extends JpaRepository<AiInsightCache, Long> {

    @Query("SELECT c FROM AiInsightCache c WHERE c.userId = :userId AND c.insightType = :type AND c.referenceKey = :refKey AND c.expiresAt > CURRENT_TIMESTAMP")
    Optional<AiInsightCache> findFresh(@Param("userId") Long userId,
                                       @Param("type") AiInsightCache.InsightType type,
                                       @Param("refKey") String refKey);

    Optional<AiInsightCache> findByUserIdAndInsightTypeAndReferenceKey(Long userId, AiInsightCache.InsightType type, String refKey);

    @org.springframework.transaction.annotation.Transactional
    void deleteByUserIdAndInsightType(Long userId, AiInsightCache.InsightType type);
}
