package com.ecotrack.admin.controller;

import com.ecotrack.admin.dto.request.UpdateUserStatusRequest;
import com.ecotrack.admin.dto.response.AdminDashboardResponse;
import com.ecotrack.admin.dto.response.UserDetailResponse;
import com.ecotrack.admin.dto.response.UserSummaryResponse;
import com.ecotrack.admin.service.AdminService;
import com.ecotrack.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final com.ecotrack.challenge.service.ChallengeService challengeService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboardSummary() {
        return ResponseEntity.ok(adminService.getDashboardSummary());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard/pulse")
    public ResponseEntity<com.ecotrack.admin.dto.response.AdminDashboardPulseDTO> getDashboardPulse() {
        return ResponseEntity.ok(adminService.getDashboardPulse());
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserSummaryResponse>> getUsers(
            Pageable pageable,
            @RequestParam(required = false) String search) {
        log.info("Admin fetching users with search: {}", search);
        Page<UserSummaryResponse> response = adminService.getUsers(pageable, search);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDetailResponse> getUser(@PathVariable Long id) {
        log.info("Admin fetching user details for ID: {}", id);
        UserDetailResponse response = adminService.getUser(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserDetailResponse> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            Authentication authentication) {
        log.info("Admin updating status for user ID: {} to {}", id, request.getStatus());
        Long adminId = getUserId(authentication);
        UserDetailResponse response = adminService.updateUserStatus(adminId, id, request.getStatus());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserDetailResponse> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody com.ecotrack.admin.dto.request.UpdateUserRoleRequest request,
            Authentication authentication) {
        log.info("Admin updating role for user ID: {} to {}", id, request.getRole());
        Long adminId = getUserId(authentication);
        UserDetailResponse response = adminService.updateUserRole(adminId, id, request.getRole());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}/challenges")
    public ResponseEntity<Page<com.ecotrack.challenge.dto.ChallengeParticipantDTO>> getUserChallenges(
            @PathVariable Long id, Pageable pageable) {
        log.info("Admin fetching challenge history for user ID: {}", id);
        return ResponseEntity.ok(challengeService.getUserChallenges(id, pageable));
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
