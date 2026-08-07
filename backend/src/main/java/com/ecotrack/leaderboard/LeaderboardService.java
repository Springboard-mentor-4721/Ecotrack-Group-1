package com.ecotrack.leaderboard;

import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserGamificationProfileRepository profileRepository;
    private final com.ecotrack.gamification.repository.XpLedgerRepository xpLedgerRepository;
    private final UserRepository userRepository;

    public List<LeaderboardEntryDTO> getAllTimeLeaderboard() {
        var topProfiles = profileRepository.findTop50ByOrderByLifetimeEcoXpDesc();
        
        List<Long> userIds = topProfiles.stream()
                .map(p -> p.getUserId())
                .collect(Collectors.toList());
                
        Map<Long, String> userNames = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getName));

        return topProfiles.stream()
                .map(p -> LeaderboardEntryDTO.builder()
                        .userId(p.getUserId())
                        .username(userNames.getOrDefault(p.getUserId(), "User " + p.getUserId()))
                        .scoreValue(p.getLifetimeEcoXp())
                        .build())
                .collect(Collectors.toList());
    }

    public List<LeaderboardEntryDTO> getMonthlyLeaderboard() {
        java.time.LocalDateTime startOfMonth = java.time.LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        return xpLedgerRepository.findTopUsersByXpSince(startOfMonth, org.springframework.data.domain.PageRequest.of(0, 50)).stream()
                .map(row -> LeaderboardEntryDTO.builder()
                        .userId((Long) row[0])
                        .username((String) row[1])
                        .scoreValue(((Number) row[2]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    public List<LeaderboardEntryDTO> getWeeklyLeaderboard() {
        java.time.LocalDateTime startOfWeek = java.time.LocalDateTime.now().minusDays(7);
        return xpLedgerRepository.findTopUsersByXpSince(startOfWeek, org.springframework.data.domain.PageRequest.of(0, 50)).stream()
                .map(row -> LeaderboardEntryDTO.builder()
                        .userId((Long) row[0])
                        .username((String) row[1])
                        .scoreValue(((Number) row[2]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    public LeaderboardEntryDTO getMyRank(Long userId) {
        return profileRepository.findByUserId(userId)
                .map(profile -> {
                    long xp = profile.getLifetimeEcoXp() != null ? profile.getLifetimeEcoXp() : 0L;
                    long betterRankCount = profileRepository.countByLifetimeEcoXpGreaterThan(xp);
                    String username = userRepository.findById(userId)
                            .map(User::getName)
                            .orElse("User " + userId);
                            
                    return LeaderboardEntryDTO.builder()
                            .userId(userId)
                            .username(username)
                            .scoreValue(xp)
                            .rank((int) betterRankCount + 1)
                            .build();
                })
                .orElseGet(() -> LeaderboardEntryDTO.builder().userId(userId).rank(-1).build());
    }
}
