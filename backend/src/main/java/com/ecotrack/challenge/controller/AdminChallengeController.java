package com.ecotrack.challenge.controller;

import com.ecotrack.challenge.dto.ChallengeDTO;
import com.ecotrack.challenge.dto.ChallengeRequest;
import com.ecotrack.challenge.service.ChallengeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/challenges")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminChallengeController {

    private final ChallengeService challengeService;

    @PostMapping
    public ResponseEntity<ChallengeDTO> createChallenge(@Valid @RequestBody ChallengeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(challengeService.createChallenge(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChallengeDTO> updateChallenge(
            @PathVariable Long id,
            @Valid @RequestBody ChallengeRequest request) {
        return ResponseEntity.ok(challengeService.updateChallenge(id, request));
    }

    @PutMapping("/{id}/moderate")
    public ResponseEntity<ChallengeDTO> moderateChallenge(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String action = body.get("action");
        return ResponseEntity.ok(challengeService.moderateChallenge(id, action));
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<Void> archiveChallenge(@PathVariable Long id) {
        challengeService.archiveChallenge(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<ChallengeDTO>> getAdminChallenges(Pageable pageable) {
        return ResponseEntity.ok(challengeService.getAllChallenges(pageable));
    }
}
