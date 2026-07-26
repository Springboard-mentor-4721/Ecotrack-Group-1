package com.ecotrack.goal.controller;

import com.ecotrack.goal.dto.GoalAnalyticsResponse;
import com.ecotrack.goal.dto.GoalProgressRequest;
import com.ecotrack.goal.dto.GoalProgressResponse;
import com.ecotrack.goal.dto.GoalRequest;
import com.ecotrack.goal.dto.GoalResponse;
import com.ecotrack.goal.service.GoalService;
import com.ecotrack.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;
    private final UserRepository userRepository;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(
            @Valid @RequestBody GoalRequest request,
            Authentication authentication) {
        log.info("Creating new goal");
        Long userId = getUserId(authentication);
        GoalResponse response = goalService.createGoal(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<Page<GoalResponse>> getUserGoals(
            Pageable pageable,
            Authentication authentication) {
        log.info("Fetching goals for user");
        Long userId = getUserId(authentication);
        Page<GoalResponse> response = goalService.getUserGoals(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> getGoalById(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Fetching goal by ID");
        Long userId = getUserId(authentication);
        GoalResponse response = goalService.getGoal(userId, id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody GoalRequest request,
            Authentication authentication) {
        log.info("Updating goal by ID");
        Long userId = getUserId(authentication);
        GoalResponse response = goalService.updateGoal(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Deleting goal by ID");
        Long userId = getUserId(authentication);
        goalService.deleteGoal(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/{id}/progress")
    public ResponseEntity<GoalProgressResponse> recordProgress(
            @PathVariable Long id,
            @Valid @RequestBody GoalProgressRequest request,
            Authentication authentication) {
        log.info("Recording progress for goal");
        Long userId = getUserId(authentication);
        GoalProgressResponse response = goalService.recordProgress(userId, id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/{id}/analytics")
    public ResponseEntity<GoalAnalyticsResponse> getGoalAnalytics(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Fetching analytics for goal");
        Long userId = getUserId(authentication);
        GoalAnalyticsResponse response = goalService.getGoalAnalytics(userId, id);
        return ResponseEntity.ok(response);
    }

    /**
     * Helper method to extract the userId from the authentication principal.
     */
    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"))
                .getId();
    }
}
