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

import java.util.List;

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
        Long userId = getUserId(authentication);
        GoalResponse response = goalService.createGoal(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<Page<GoalResponse>> getAllGoals(
            Authentication authentication,
            Pageable pageable) {
        Long userId = getUserId(authentication);
        Page<GoalResponse> response = goalService.getAllGoals(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/{goalId}")
    public ResponseEntity<GoalResponse> getGoal(
            @PathVariable Long goalId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        GoalResponse response = goalService.getGoal(userId, goalId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping("/{goalId}")
    public ResponseEntity<GoalResponse> updateGoal(
            @PathVariable Long goalId,
            @Valid @RequestBody GoalRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        GoalResponse response = goalService.updateGoal(userId, goalId, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable Long goalId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        goalService.deleteGoal(userId, goalId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/{goalId}/progress")
    public ResponseEntity<GoalProgressResponse> addProgress(
            @PathVariable Long goalId,
            @Valid @RequestBody GoalProgressRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        GoalProgressResponse response = goalService.addProgress(userId, goalId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/{goalId}/progress")
    public ResponseEntity<List<GoalProgressResponse>> getGoalProgress(
            @PathVariable Long goalId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        List<GoalProgressResponse> response = goalService.getGoalProgress(userId, goalId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/analytics")
    public ResponseEntity<GoalAnalyticsResponse> getAnalytics(Authentication authentication) {
        Long userId = getUserId(authentication);
        GoalAnalyticsResponse response = goalService.getAnalytics(userId);
        return ResponseEntity.ok(response);
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"))
                .getId();
    }
}
