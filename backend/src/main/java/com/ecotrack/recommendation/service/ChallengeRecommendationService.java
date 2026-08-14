package com.ecotrack.recommendation.service;

import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.dto.ChallengeDTO;
import com.ecotrack.challenge.service.ChallengeService;
import com.ecotrack.recommendation.dto.UserContextDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeRecommendationService {

    private final ChallengeService challengeService;
    private final ContextAssemblyService contextAssemblyService;
    private final ChatClient.Builder chatClientBuilder;

    @Value("${ecotrack.ai.enabled:true}")
    private boolean aiEnabled;

    @Value("${ecotrack.ai.models.smart-suggestion:gemini-3.5-flash-lite}")
    private String aiModel;

    public List<ChallengeDTO> getRecommendedChallenges(Long userId) {
        if (!aiEnabled) {
            log.warn("AI features disabled. Returning fallback challenges.");
            return getFallbackChallenges(userId);
        }

        // 1. Candidate Selection
        Page<ChallengeDTO> candidatePage = challengeService.getActiveChallenges(userId, null, null, null, PageRequest.of(0, 15));
        List<ChallengeDTO> candidates = candidatePage.getContent();
        if (candidates.isEmpty()) {
            return List.of();
        }

        // 2. Build User Context
        UserContextDTO userContext = contextAssemblyService.assembleContext(userId, List.of());
        if (userContext.getEligibleTargets().isEmpty() && userContext.getLifestyleConstraints().isEmpty()) {
            log.info("Insufficient user context for personalized recommendation. Returning fallback.");
            return candidates.stream().limit(3).toList();
        }

        // 3. AI Query
        String candidatesJson = buildCandidatesJson(candidates);
        String contextJson = buildContextJson(userContext);

        String promptText = """
                You are an AI Sustainability Coach.
                Based on the following user context, select the top 3 most relevant challenges from the candidate list.
                
                USER CONTEXT:
                {context}
                
                CANDIDATE CHALLENGES:
                {candidates}
                
                Return ONLY a comma-separated list of the 3 most recommended challenge IDs.
                Do NOT include any extra text, explanations, or IDs that are not in the candidate list.
                """;

        PromptTemplate promptTemplate = new PromptTemplate(promptText);
        String responseText;
        try {
            responseText = chatClientBuilder.build().prompt(promptTemplate.create(Map.of(
                    "context", contextJson,
                    "candidates", candidatesJson
            ))).call().content();
        } catch (Exception e) {
            log.error("AI recommendation failed: {}", e.getMessage());
            return candidates.stream().limit(3).toList();
        }

        // 4. Parse & Validate
        List<Long> recommendedIds = parseAndValidateIds(responseText, candidates);
        if (recommendedIds.isEmpty()) {
            return candidates.stream().limit(3).toList();
        }

        return candidates.stream()
                .filter(c -> recommendedIds.contains(c.getId()))
                .toList();
    }

    private String buildCandidatesJson(List<ChallengeDTO> candidates) {
        StringBuilder sb = new StringBuilder();
        for (ChallengeDTO c : candidates) {
            sb.append("ID: ").append(c.getId())
              .append(", Title: ").append(c.getTitle())
              .append(", Description: ").append(c.getDescription())
              .append("\n");
        }
        return sb.toString();
    }

    private String buildContextJson(UserContextDTO userContext) {
        StringBuilder sb = new StringBuilder();
        sb.append("Interests/Lifestyle Constraints: ").append(String.join(", ", userContext.getLifestyleConstraints())).append("\n");
        sb.append("Priority Targets (Goals/High Emissions): \n");
        for (var target : userContext.getEligibleTargets()) {
            sb.append("- ").append(target.getCategoryCode()).append(" / ").append(target.getSubCategoryName())
              .append(" (").append(target.getReason()).append(")\n");
        }
        return sb.toString();
    }

    private List<Long> parseAndValidateIds(String response, List<ChallengeDTO> candidates) {
        List<Long> validIds = new ArrayList<>();
        List<Long> candidateIds = candidates.stream().map(ChallengeDTO::getId).toList();
        
        String[] parts = response.replace("\"", "").replace("[", "").replace("]", "").split(",");
        for (String part : parts) {
            try {
                Long id = Long.parseLong(part.trim());
                if (candidateIds.contains(id) && validIds.size() < 3) {
                    validIds.add(id);
                }
            } catch (NumberFormatException ignored) {}
        }
        return validIds;
    }

    private List<ChallengeDTO> getFallbackChallenges(Long userId) {
        return challengeService.getActiveChallenges(userId, null, null, null, PageRequest.of(0, 3)).getContent();
    }
}
