package com.ecotrack.search.service;

import com.ecotrack.search.dto.ChallengeSearchResponse;
import com.ecotrack.search.dto.RecommendationResponse;
import com.ecotrack.search.dto.UserSearchResponse;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final UserRepository userRepository;

    public Page<UserSearchResponse> searchUsers(String query, Pageable pageable) {
        log.info("Searching users with query: {}", query);
        return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable)
                .map(user -> UserSearchResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .build());
    }

    public Page<ChallengeSearchResponse> searchChallenges(String query, Pageable pageable) {
        log.info("Searching challenges with query: {} (Stubbed)", query);
        // TODO: Implement challenge search logic when the Challenge entity and repository are created.
        // Currently returning an empty list to satisfy API contracts.
        return new PageImpl<>(Collections.emptyList(), pageable, 0);
    }

    public Page<RecommendationResponse> searchRecommendations(String query, Pageable pageable) {
        log.info("Searching recommendations with query: {} (Stubbed)", query);
        // TODO: Implement actual recommendation logic when the Recommendation engine/models are available.
        // Returning a mock recommendation as a proof of concept.
        RecommendationResponse mockRecommendation = RecommendationResponse.builder()
                .type("CHALLENGE")
                .title("Complete 5 eco-actions this week")
                .description("Suggested based on your recent activity")
                .build();
        return new PageImpl<>(List.of(mockRecommendation), pageable, 1);
    }
}
