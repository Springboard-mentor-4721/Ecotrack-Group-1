package com.ecotrack.leaderboard;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboards")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final com.ecotrack.user.repository.UserRepository userRepository;

    @GetMapping("/all-time")
    public ResponseEntity<List<LeaderboardEntryDTO>> getAllTimeLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getAllTimeLeaderboard());
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<LeaderboardEntryDTO>> getMonthlyLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getMonthlyLeaderboard());
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<LeaderboardEntryDTO>> getWeeklyLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getWeeklyLeaderboard());
    }

    @GetMapping("/my-rank")
    public ResponseEntity<LeaderboardEntryDTO> getMyRank(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"))
                .getId();
        return ResponseEntity.ok(leaderboardService.getMyRank(userId));
    }
    @GetMapping("/global")
    public ResponseEntity<org.springframework.data.domain.Page<LeaderboardEntryDTO>> getGlobalLeaderboard(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "XP") com.ecotrack.leaderboard.enums.LeaderboardType type,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "ALL_TIME") com.ecotrack.leaderboard.enums.LeaderboardPeriod period,
            org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard(type, period, pageable));
    }

    @GetMapping("/challenge/{challengeId}")
    public ResponseEntity<org.springframework.data.domain.Page<LeaderboardEntryDTO>> getChallengeLeaderboard(
            @org.springframework.web.bind.annotation.PathVariable Long challengeId,
            org.springframework.security.core.Authentication authentication,
            org.springframework.data.domain.Pageable pageable) {
        String email = authentication.getName();
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"))
                .getId();
        return ResponseEntity.ok(leaderboardService.getChallengeLeaderboard(challengeId, userId, pageable));
    }
}
