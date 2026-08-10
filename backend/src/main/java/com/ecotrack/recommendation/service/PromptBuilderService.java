package com.ecotrack.recommendation.service;

import com.ecotrack.recommendation.dto.UserContextDTO;
import org.springframework.stereotype.Service;

@Service
public class PromptBuilderService {

    public String buildPrompt(UserContextDTO context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are EcoTrack's AI personalization engine. Generate up to 3 high-confidence sustainability recommendations.\n");
        prompt.append("RULES:\n");
        prompt.append("1. You may ONLY use the `categoryCode` and `subCategoryName` pairs provided in `eligibleTargets`.\n");
        prompt.append("2. Do NOT invent categories or numbers.\n");
        prompt.append("3. Provide a clear, personalized `rationale` based on the provided `reason`.\n");
        
        if (context.getLifestyleConstraints() != null && !context.getLifestyleConstraints().isEmpty()) {
            prompt.append("4. Respect lifestyle constraints: ").append(String.join(", ", context.getLifestyleConstraints())).append("\n");
        }
        
        if (context.getPreviousRecommendations() != null && !context.getPreviousRecommendations().isEmpty()) {
            prompt.append("5. DO NOT recommend concepts found in these previous recommendations: ").append(String.join("; ", context.getPreviousRecommendations())).append("\n");
        }
        
        prompt.append("Return the output as a JSON array where each object has: 'categoryCode' (string), 'subCategoryName' (string), 'recommendation' (string), and 'rationale' (string).\n\n");
        
        prompt.append("Eligible Targets:\n");
        if (context.getEligibleTargets() != null && !context.getEligibleTargets().isEmpty()) {
            for (com.ecotrack.recommendation.dto.EligibleTargetDTO target : context.getEligibleTargets()) {
                prompt.append(String.format("- Category: %s, SubCategory: %s, Reason: %s\n", target.getCategoryCode(), target.getSubCategoryName(), target.getReason()));
            }
        } else {
            prompt.append("No specific eligible targets found. Please recommend general tracking activities.\n");
        }
        
        return prompt.toString();
    }
}
