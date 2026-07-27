package com.ecotrack.recommendation.controller;

import com.ecotrack.recommendation.dto.RecommendationDTO;
import com.ecotrack.recommendation.service.AiRecommendationService;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final AiRecommendationService recommendationService;
    private final UserRepository userRepository;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<Page<RecommendationDTO>> getRecommendations(
            Pageable pageable,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(recommendationService.getRecommendations(userId, pageable));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/generate")
    public ResponseEntity<List<RecommendationDTO>> generateRecommendations(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(recommendationService.generateRecommendations(userId));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        recommendationService.markAsRead(userId, id);
        return ResponseEntity.ok().build();
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"))
                .getId();
    }
}
