package com.ecotrack.ai.history;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiHistoryCleanupService {

    private final AiGenerationHistoryRepository historyRepository;
    private static final int MAX_HISTORY_RECORDS = 20;

    @Async("aiTaskExecutor")
    @Transactional
    public void cleanupOldHistory(Long userId) {
        try {
            // Find all history records for the user ordered by generatedAt DESC
            // Since we need to keep the newest 20, we fetch the IDs of those 20.
            List<AiGenerationHistory> top20 = historyRepository.findTop20ByUserIdOrderByGeneratedAtDesc(userId);
            
            if (top20.size() >= MAX_HISTORY_RECORDS) {
                List<Long> top20Ids = top20.stream().map(AiGenerationHistory::getId).collect(Collectors.toList());
                // Delete everything else for this user
                historyRepository.deleteByUserIdAndIdNotIn(userId, top20Ids);
                log.debug("Cleaned up old AI history records for user {}", userId);
            }
        } catch (Exception e) {
            log.error("Failed to cleanup old AI history for user {}", userId, e);
        }
    }
}
