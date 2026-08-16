package com.ecotrack.ai.history;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiGenerationHistoryRepository extends JpaRepository<AiGenerationHistory, Long> {
    Page<AiGenerationHistory> findByUserId(Long userId, Pageable pageable);
    Page<AiGenerationHistory> findByUserIdAndContentType(Long userId, AiGenerationHistory.ContentType contentType, Pageable pageable);
    java.util.List<AiGenerationHistory> findTop5ByUserIdAndContentTypeOrderByGeneratedAtDesc(Long userId, AiGenerationHistory.ContentType contentType);
    java.util.List<AiGenerationHistory> findTop20ByUserIdOrderByGeneratedAtDesc(Long userId);
    void deleteByUserIdAndIdNotIn(Long userId, java.util.List<Long> ids);
}
