package com.ecotrack.leaderboard;

import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class LeaderboardServiceTest {

    @Mock
    private UserGamificationProfileRepository profileRepository;

    @InjectMocks
    private LeaderboardService leaderboardService;

    @Test
    void testServiceNotNull() {
        assertNotNull(leaderboardService);
    }
}
