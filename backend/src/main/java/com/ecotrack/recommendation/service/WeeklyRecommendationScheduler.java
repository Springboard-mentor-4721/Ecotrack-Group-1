package com.ecotrack.recommendation.service;

import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeeklyRecommendationScheduler {

    private final UserRepository userRepository;
    private final AiRecommendationService recommendationService;

    // @Scheduled(cron = "0 0 8 * * MON") // Disabled per AI redesign to remove implicit Gemini calls
    public void generateWeeklyRecommendations() {
        log.info("Generating weekly recommendations");
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            try {
                recommendationService.generateRecommendations(user.getId());
            } catch (Exception e) {
                log.warn("Failed to generate weekly recommendation for user {}", user.getId(), e);
            }
        }
    }
}
