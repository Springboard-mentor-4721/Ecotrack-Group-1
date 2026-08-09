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

        List<LeaderboardEntryDTO> dtos = new java.util.ArrayList<>();
        int rank = 1;
        for (int i = 0; i < topProfiles.size(); i++) {
            var p = topProfiles.get(i);
            long currentXp = p.getLifetimeEcoXp() != null ? p.getLifetimeEcoXp() : 0L;
            long xpToNextRank = 0L;
            
            if (i > 0) {
                long prevXp = topProfiles.get(i - 1).getLifetimeEcoXp() != null ? topProfiles.get(i - 1).getLifetimeEcoXp() : 0L;
                xpToNextRank = Math.max(0, prevXp - currentXp + 1);
            }
            
            dtos.add(LeaderboardEntryDTO.builder()
                        .userId(p.getUserId())
                        .username(userNames.getOrDefault(p.getUserId(), "User " + p.getUserId()))
                        .scoreValue(currentXp)
                        .rank(rank++)
                        .level(p.getCurrentLevel())
                        .xpToNextRank(xpToNextRank)
                        .build());
        }
        return dtos;
    }

    public List<LeaderboardEntryDTO> getMonthlyLeaderboard() {
        java.time.LocalDateTime startOfMonth = java.time.LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        var rows = xpLedgerRepository.findTopUsersByXpSince(startOfMonth, org.springframework.data.domain.PageRequest.of(0, 50));
        return mapRowsToLeaderboard(rows);
    }

    public List<LeaderboardEntryDTO> getWeeklyLeaderboard() {
        java.time.LocalDateTime startOfWeek = java.time.LocalDateTime.now().minusDays(7);
        var rows = xpLedgerRepository.findTopUsersByXpSince(startOfWeek, org.springframework.data.domain.PageRequest.of(0, 50));
        return mapRowsToLeaderboard(rows);
    }

    private List<LeaderboardEntryDTO> mapRowsToLeaderboard(List<Object[]> rows) {
        List<Long> userIds = rows.stream().map(row -> (Long) row[0]).collect(Collectors.toList());
        Map<Long, com.ecotrack.gamification.entity.UserGamificationProfile> profiles = profileRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(com.ecotrack.gamification.entity.UserGamificationProfile::getUserId, p -> p));

        List<LeaderboardEntryDTO> dtos = new java.util.ArrayList<>();
        int rank = 1;
        for (int i = 0; i < rows.size(); i++) {
            Object[] row = rows.get(i);
            long currentXp = ((Number) row[2]).longValue();
            long xpToNextRank = 0L;
            if (i > 0) {
                long prevXp = ((Number) rows.get(i - 1)[2]).longValue();
                xpToNextRank = Math.max(0, prevXp - currentXp + 1);
            }
            Long uId = (Long) row[0];
            var p = profiles.get(uId);
            int level = p != null ? p.getCurrentLevel() : 1;

            dtos.add(LeaderboardEntryDTO.builder()
                    .userId(uId)
                    .username((String) row[1])
                    .scoreValue(currentXp)
                    .rank(rank++)
                    .level(level)
                    .xpToNextRank(xpToNextRank)
                    .build());
        }
        return dtos;
    }

    public LeaderboardEntryDTO getMyRank(Long userId) {
        return profileRepository.findByUserId(userId)
                .map(profile -> {
                    long xp = profile.getLifetimeEcoXp() != null ? profile.getLifetimeEcoXp() : 0L;
                    long betterRankCount = profileRepository.countByLifetimeEcoXpGreaterThan(xp);
                    String username = userRepository.findById(userId)
                            .map(User::getName)
                            .orElse("User " + userId);
                            
                    long xpToNextRank = 0L;
                    if (betterRankCount > 0) {
                        xpToNextRank = profileRepository.findLowestXpGreaterThan(xp)
                                .map(val -> val - xp + 1)
                                .orElse(0L);
                    }

                    return LeaderboardEntryDTO.builder()
                            .userId(userId)
                            .username(username)
                            .scoreValue(xp)
                            .rank((int) betterRankCount + 1)
                            .level(profile.getCurrentLevel())
                            .xpToNextRank(xpToNextRank)
                            .build();
                })
                .orElseGet(() -> LeaderboardEntryDTO.builder().userId(userId).rank(-1).build());
    }
}
