package com.ecotrack.gamification.controller;

import com.ecotrack.gamification.dto.AdminBadgeDTO;
import com.ecotrack.gamification.dto.BadgeDefinitionRequest;
import com.ecotrack.gamification.service.BadgeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/badges")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBadgeController {

    private final BadgeService badgeService;

    @PostMapping
    public ResponseEntity<AdminBadgeDTO> createBadge(@Valid @RequestBody BadgeDefinitionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(badgeService.createBadge(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminBadgeDTO> updateBadge(
            @PathVariable Long id,
            @Valid @RequestBody BadgeDefinitionRequest request) {
        return ResponseEntity.ok(badgeService.updateBadge(id, request));
    }

    @PutMapping("/{id}/disable")
    public ResponseEntity<Void> disableBadge(@PathVariable Long id) {
        badgeService.disableBadge(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<AdminBadgeDTO>> getAdminBadges(Pageable pageable) {
        return ResponseEntity.ok(badgeService.getAllBadges(pageable));
    }
}
