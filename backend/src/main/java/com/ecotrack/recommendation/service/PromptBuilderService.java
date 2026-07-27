package com.ecotrack.recommendation.service;

import com.ecotrack.recommendation.dto.UserContextDTO;
import org.springframework.stereotype.Service;

@Service
public class PromptBuilderService {

    public String buildPrompt(UserContextDTO context) {
        return String.format(
            "Generate exactly 3 specific, actionable sustainability recommendations for a user. " +
            "User's recent activity: %s. Active goals: %s. Current Eco Score: %d. Interests: %s. " +
            "Return the output as a JSON array where each object has: " +
            "'category' (string), 'recommendation' (string), and 'estimatedReduction' (number).",
            context.getRecentCarbonActivity(),
            context.getActiveGoals(),
            context.getCurrentEcoScore(),
            context.getInterests()
        );
    }
}
