package com.ecotrack.challenge.controller;

import com.ecotrack.challenge.dto.ChallengeDTO;
import com.ecotrack.challenge.dto.ChallengeRequest;
import com.ecotrack.challenge.dto.ChallengeDetailDTO;
import com.ecotrack.challenge.dto.ChallengeParticipantDTO;
import com.ecotrack.challenge.dto.ChallengeStatsDTO;
import com.ecotrack.challenge.dto.ChallengeAnalyticsDTO;
import com.ecotrack.challenge.enums.ChallengeStatus;
import com.ecotrack.challenge.enums.TrackingMethod;
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
    public ResponseEntity<Page<ChallengeDTO>> getAdminChallenges(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "status", required = false) ChallengeStatus status,
            @RequestParam(name = "trackingMethod", required = false) TrackingMethod trackingMethod,
            Pageable pageable) {
        return ResponseEntity.ok(challengeService.getAllChallenges(search, status, trackingMethod, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChallengeDetailDTO> getAdminChallengeDetail(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.getAdminChallengeDetail(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<ChallengeStatsDTO> getChallengeStats() {
        return ResponseEntity.ok(challengeService.getChallengeStats());
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<Page<ChallengeParticipantDTO>> getChallengeParticipants(
            @PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(challengeService.getChallengeParticipants(id, pageable));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ChallengeAnalyticsDTO> getChallengeAnalytics() {
        return ResponseEntity.ok(challengeService.getChallengeAnalytics());
    }
}
