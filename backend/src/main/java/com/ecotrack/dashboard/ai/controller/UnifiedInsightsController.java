package com.ecotrack.dashboard.ai.controller;

import com.ecotrack.dashboard.ai.dto.AiInsightsResponse;
import com.ecotrack.dashboard.ai.service.UnifiedInsightsService;
import com.ecotrack.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/dashboard/ai/insights")
public class UnifiedInsightsController {

    private final UnifiedInsightsService unifiedInsightsService;
    private final UserRepository userRepository;

    public UnifiedInsightsController(UnifiedInsightsService unifiedInsightsService, UserRepository userRepository) {
        this.unifiedInsightsService = unifiedInsightsService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<AiInsightsResponse> getLatestInsight(Authentication authentication) {
        Long userId = getUserId(authentication);
        Optional<AiInsightsResponse> insight = unifiedInsightsService.getLatestInsight(userId);
        return insight.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/generate")
    public ResponseEntity<AiInsightsResponse> generateInsight(Authentication authentication) {
        Long userId = getUserId(authentication);
        AiInsightsResponse response = unifiedInsightsService.generateInsight(userId);
        return ResponseEntity.ok(response);
    }
    
    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"))
                .getId();
    }
}
