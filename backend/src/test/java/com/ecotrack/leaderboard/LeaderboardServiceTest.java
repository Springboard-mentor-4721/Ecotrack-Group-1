package com.ecotrack.leaderboard;

import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class LeaderboardServiceTest {

    @Mock
    private UserGamificationProfileRepository profileRepository;

    @Mock
    private com.ecotrack.user.repository.UserRepository userRepository;

    @Mock
    private com.ecotrack.gamification.repository.XpLedgerRepository xpLedgerRepository;

    @InjectMocks
    private LeaderboardService leaderboardService;

    @Test
    void testServiceNotNull() {
        assertNotNull(leaderboardService);
    }

    @Test
    void testWeeklyLeaderboard() {
        Object[] row = new Object[]{1L, "TestUser", 1500L};
        when(xpLedgerRepository.findTopUsersByXpSince(any(LocalDateTime.class), any(PageRequest.class)))
                .thenReturn(Collections.singletonList(row));

        List<LeaderboardEntryDTO> result = leaderboardService.getWeeklyLeaderboard();

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getUserId());
        assertEquals("TestUser", result.get(0).getUsername());
        assertEquals(1500L, result.get(0).getScoreValue());
        
        // Cannot easily verify exact LocalDateTime in mock, but we verified mapping works.
    }

    @Test
    void testMonthlyLeaderboard() {
        Object[] row = new Object[]{2L, "MonthUser", 3000L};
        when(xpLedgerRepository.findTopUsersByXpSince(any(LocalDateTime.class), any(PageRequest.class)))
                .thenReturn(Collections.singletonList(row));

        List<LeaderboardEntryDTO> result = leaderboardService.getMonthlyLeaderboard();

        assertEquals(1, result.size());
        assertEquals(2L, result.get(0).getUserId());
        assertEquals("MonthUser", result.get(0).getUsername());
        assertEquals(3000L, result.get(0).getScoreValue());
        assertEquals(1, result.get(0).getLevel());
        assertEquals(0L, result.get(0).getXpToNextRank());
    }

    @Test
    void testGetAllTimeLeaderboard() {
        com.ecotrack.gamification.entity.UserGamificationProfile profile = 
            com.ecotrack.gamification.entity.UserGamificationProfile.builder()
                .userId(1L)
                .lifetimeEcoXp(5000L)
                .build();
        when(profileRepository.findTop50ByOrderByLifetimeEcoXpDesc())
                .thenReturn(Collections.singletonList(profile));

        com.ecotrack.user.entity.User user = new com.ecotrack.user.entity.User();
        user.setId(1L);
        user.setName("Real Name");
        when(userRepository.findAllById(any())).thenReturn(Collections.singletonList(user));

        List<LeaderboardEntryDTO> result = leaderboardService.getAllTimeLeaderboard();

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getUserId());
        assertEquals("Real Name", result.get(0).getUsername());
        assertEquals(5000L, result.get(0).getScoreValue());
        assertEquals(1, result.get(0).getLevel());
        assertEquals(0L, result.get(0).getXpToNextRank());
        
        verify(userRepository).findAllById(Collections.singletonList(1L));
    }

    @Test
    void testGetMyRank() {
        com.ecotrack.gamification.entity.UserGamificationProfile profile = 
            com.ecotrack.gamification.entity.UserGamificationProfile.builder()
                .userId(2L)
                .lifetimeEcoXp(2000L)
                .build();
        when(profileRepository.findByUserId(2L)).thenReturn(java.util.Optional.of(profile));
        when(profileRepository.countByLifetimeEcoXpGreaterThan(2000L)).thenReturn(5L);
        
        com.ecotrack.user.entity.User user = new com.ecotrack.user.entity.User();
        user.setId(2L);
        user.setName("My Real Name");
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(user));

        LeaderboardEntryDTO result = leaderboardService.getMyRank(2L);

        assertNotNull(result);
        assertEquals(2L, result.getUserId());
        assertEquals("My Real Name", result.getUsername());
        assertEquals(2000L, result.getScoreValue());
        assertEquals(6, result.getRank());
        assertEquals(1, result.getLevel());
        assertEquals(0L, result.getXpToNextRank());
    }
}
