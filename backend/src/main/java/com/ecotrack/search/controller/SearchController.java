package com.ecotrack.search.controller;

import com.ecotrack.search.dto.ChallengeSearchResponse;
import com.ecotrack.search.dto.RecommendationResponse;
import com.ecotrack.search.dto.UserSearchResponse;
import com.ecotrack.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/users")
    public ResponseEntity<Page<UserSearchResponse>> searchUsers(
            @RequestParam String query,
            Pageable pageable) {
        Page<UserSearchResponse> response = searchService.searchUsers(query, pageable);
        return ResponseEntity.ok(response);
    }

    // TODO: Implement challenge search API fully when Challenge entity is available.
    @GetMapping("/challenges")
    public ResponseEntity<Page<ChallengeSearchResponse>> searchChallenges(
            @RequestParam String query,
            Pageable pageable) {
        Page<ChallengeSearchResponse> response = searchService.searchChallenges(query, pageable);
        return ResponseEntity.ok(response);
    }

    // TODO: Implement recommendations API fully when Recommendation engine/models are available.
    @GetMapping("/recommendations")
    public ResponseEntity<Page<RecommendationResponse>> searchRecommendations(
            @RequestParam(required = false, defaultValue = "") String query,
            Pageable pageable) {
        Page<RecommendationResponse> response = searchService.searchRecommendations(query, pageable);
        return ResponseEntity.ok(response);
    }
}
