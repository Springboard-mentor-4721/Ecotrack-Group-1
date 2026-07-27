package com.ecotrack.recommendation.service;

import com.ecotrack.recommendation.dto.UserContextDTO;
import org.springframework.stereotype.Service;

@Service
public class ContextAssemblyService {

    public UserContextDTO assembleContext(Long userId) {
        // In a real application, we would query:
        // - CarbonTrackingRepository for recent entries
        // - GoalRepository for active goals
        // - GamificationProfileRepository for eco score
        
        // Mocking the context for now as per TDS:
        return UserContextDTO.builder()
                .userId(userId)
                .recentCarbonActivity("3 car trips, 1 meat-based meal")
                .activeGoals("Reduce transportation emissions")
                .currentEcoScore(1250)
                .interests("Renewable energy, Diet")
                .build();
    }
}
