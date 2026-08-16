package com.ecotrack.recommendation.service;

import com.ecotrack.recommendation.dto.UserContextDTO;
import org.springframework.stereotype.Service;

@Service
public class PromptBuilderService {

    public String buildPrompt(UserContextDTO context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are EcoTrack's AI personalization engine. Generate 2 to 4 high-confidence sustainability recommendations based on the user's data.\n");
        prompt.append("RULES:\n");
        prompt.append("1. Provide practical, actionable, and specific recommendations relevant to the user's data.\n");
        prompt.append("2. You may generate recommendations across DIFFERENT relevant categories (e.g. TRANSPORTATION, ENERGY, WATER, FOOD, WASTE, SHOPPING, FUEL, TRAVEL).\n");
        prompt.append("3. Provide a clear, personalized `rationale` connecting the recommendation to their data (goals or carbon volume).\n");
        prompt.append("4. Do not invent completely unrelated categories not matching the standard list.\n");
        
        if (context.getLifestyleConstraints() != null && !context.getLifestyleConstraints().isEmpty()) {
            prompt.append("5. Respect lifestyle constraints: ").append(String.join(", ", context.getLifestyleConstraints())).append("\n");
        }
        
        if (context.getPreviousRecommendations() != null && !context.getPreviousRecommendations().isEmpty()) {
            prompt.append("6. DO NOT recommend concepts found in these previous recommendations: ").append(String.join("; ", context.getPreviousRecommendations())).append("\n");
        }
        
        prompt.append("Return the output as a JSON array where each object has: 'categoryCode' (string), 'subCategoryName' (string), 'recommendation' (string), and 'rationale' (string).\n\n");
        
        prompt.append("User Carbon Profile (Last 30 Days):\n");
        if (context.getCategorySummaries() != null && !context.getCategorySummaries().isEmpty()) {
            for (UserContextDTO.CategorySummaryDTO cat : context.getCategorySummaries()) {
                prompt.append(String.format("- Category: %s, Total Emissions/Volume: %.2f, Entries Logged: %d\n", cat.getCategoryCode(), cat.getTotalVolume(), cat.getEntryCount()));
            }
        } else {
            prompt.append("No carbon data logged in the last 30 days. Provide onboarding or starter recommendations.\n");
        }

        prompt.append("\nUser Goals and Budgets:\n");
        if (context.getGoals() != null && !context.getGoals().isEmpty()) {
            for (UserContextDTO.GoalSummaryDTO goal : context.getGoals()) {
                prompt.append(String.format("- Title: %s, Type: %s, Target: %.2f, Current Progress: %.2f, Status: %s\n", 
                        goal.getTitle(), goal.getType(), goal.getTargetValue(), goal.getCurrentValue(), goal.getStatus()));
            }
        } else {
            prompt.append("No active goals or budgets.\n");
        }
        
        return prompt.toString();
    }
}
