package com.ecotrack.goal.service;

import com.ecotrack.goal.dto.GoalOptimizationResponse;
import com.ecotrack.goal.dto.GoalRequest;
import com.ecotrack.tracking.repository.CarbonEntryRepository;
import com.ecotrack.tracking.repository.projection.SubCategoryVolumeProjection;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoalOptimizationService {

    private final ChatClient chatClient;
    private final CarbonEntryRepository carbonEntryRepository;
    private final ObjectMapper objectMapper;

    public GoalOptimizationResponse optimizeGoal(Long userId, GoalRequest request) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        List<SubCategoryVolumeProjection> topByVolume = carbonEntryRepository.getTopSubCategoriesByVolume(
                userId, thirtyDaysAgo, PageRequest.of(0, 5));
        
        if (topByVolume.isEmpty()) {
            throw new IllegalStateException("Not enough recent activity data to provide a reliable optimization.");
        }
        
        String recentEmissionsContext = topByVolume.stream()
                        .map(v -> v.getSubCategoryName() + " (" + v.getCategoryCode() + "): " + v.getTotalValue() + " kg CO2e")
                        .collect(Collectors.joining(", "));

        String direction = isLowerBetter(request.getGoalType().name()) ? "LOWER targets are better/more aggressive." : "HIGHER targets are better/more aggressive.";

        String systemPrompt = "You are an AI Sustainability Coach in the EcoTrack application. " +
                "Your task is to analyze a user's proposed sustainability goal and their recent 30-day emission data. " +
                "Evaluate if the goal's target is ACHIEVABLE, CONSERVATIVE, or AGGRESSIVE, and provide a single realistic target suggestion along with a brief explanation. " +
                "Do NOT invent fake emission history. Base your analysis ONLY on the provided recent emissions and the goal parameters. " +
                "IMPORTANT SEMANTICS: For this goal type, " + direction + " " +
                "Respond ONLY in valid JSON format matching this schema: " +
                "{ \"feasibility\": \"ACHIEVABLE\" | \"CONSERVATIVE\" | \"AGGRESSIVE\", \"suggestedTarget\": <number>, \"explanation\": \"<string>\" }";

        String userMessage = String.format("User's Proposed Goal:\n" +
                "- Title: %s\n" +
                "- Type: %s\n" +
                "- Target: %s %s\n" +
                "- Target Date: %s\n\n" +
                "User's Top Emissions (Last 30 Days):\n%s\n\n" +
                "Provide your JSON response.",
                request.getTitle(), request.getGoalType(), request.getTargetValue(), request.getUnit(), request.getTargetDate(), recentEmissionsContext);

        GoalOptimizationResponse parsedResponse;
        try {
            String aiResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userMessage)
                    .call().content();
                    
            log.info("AI Optimization Response: {}", aiResponse);
            
            // Clean markdown JSON ticks if present
            if (aiResponse.startsWith("```json")) {
                aiResponse = aiResponse.substring(7);
            } else if (aiResponse.startsWith("```")) {
                aiResponse = aiResponse.substring(3);
            }
            if (aiResponse.endsWith("```")) {
                aiResponse = aiResponse.substring(0, aiResponse.length() - 3);
            }
            aiResponse = aiResponse.trim();
            
            parsedResponse = objectMapper.readValue(aiResponse, GoalOptimizationResponse.class);
        } catch (Exception e) {
            log.error("Failed to generate AI goal optimization", e);
            throw new IllegalStateException("AI optimization is temporarily unavailable. You can still save your goal manually.", e);
        }

        // Validate response
        if (parsedResponse == null || parsedResponse.getFeasibility() == null || parsedResponse.getSuggestedTarget() == null) {
            throw new IllegalStateException("AI returned an incomplete response.");
        }
        
        if (!List.of("ACHIEVABLE", "CONSERVATIVE", "AGGRESSIVE").contains(parsedResponse.getFeasibility())) {
            throw new IllegalStateException("AI returned an invalid feasibility value.");
        }

        if (parsedResponse.getSuggestedTarget().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("AI returned an invalid suggested target.");
        }
        
        return parsedResponse;
    }

    private boolean isLowerBetter(String goalType) {
        return goalType.startsWith("REDUCE_");
    }
}
