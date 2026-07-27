package com.ecotrack.leaderboard;

import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserGamificationProfileRepository profileRepository;

    public List<LeaderboardEntryDTO> getAllTimeLeaderboard() {
        return profileRepository.findAll().stream()
                .sorted((p1, p2) -> Long.compare(p2.getLifetimeEcoXp(), p1.getLifetimeEcoXp()))
                .limit(50)
                .map(p -> LeaderboardEntryDTO.builder()
                        .userId(p.getUserId())
                        .username("User " + p.getUserId()) // Simplified for now
                        .scoreValue(p.getLifetimeEcoXp())
                        .build())
                .collect(Collectors.toList());
    }

    public List<LeaderboardEntryDTO> getMonthlyLeaderboard() {
        return profileRepository.findAll().stream()
                .sorted((p1, p2) -> p2.getCurrentEcoScore().compareTo(p1.getCurrentEcoScore()))
                .limit(50)
                .map(p -> LeaderboardEntryDTO.builder()
                        .userId(p.getUserId())
                        .username("User " + p.getUserId())
                        .scoreValue(p.getCurrentEcoScore().longValue())
                        .build())
                .collect(Collectors.toList());
    }

    public List<LeaderboardEntryDTO> getWeeklyLeaderboard() {
        // Simplified for demo: use currentEcoScore as well
        return profileRepository.findAll().stream()
                .sorted((p1, p2) -> p2.getCurrentEcoScore().compareTo(p1.getCurrentEcoScore()))
                .limit(50)
                .map(p -> LeaderboardEntryDTO.builder()
                        .userId(p.getUserId())
                        .username("User " + p.getUserId())
                        .scoreValue(p.getCurrentEcoScore().longValue())
                        .build())
                .collect(Collectors.toList());
    }

    public LeaderboardEntryDTO getMyRank(Long userId) {
        List<LeaderboardEntryDTO> allTime = getAllTimeLeaderboard();
        for (int i = 0; i < allTime.size(); i++) {
            if (allTime.get(i).getUserId().equals(userId)) {
                LeaderboardEntryDTO dto = allTime.get(i);
                dto.setRank(i + 1);
                return dto;
            }
        }
        return LeaderboardEntryDTO.builder().userId(userId).rank(-1).build();
    }
}
