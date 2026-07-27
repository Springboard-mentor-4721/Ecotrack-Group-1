package com.ecotrack.gamification;

import com.ecotrack.gamification.service.StreakService;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import com.ecotrack.gamification.service.XpLedgerService;
import com.ecotrack.gamification.config.GamificationConfigService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class StreakServiceTest {

    @Mock
    private UserGamificationProfileRepository profileRepository;

    @Mock
    private XpLedgerService xpLedgerService;

    @Mock
    private GamificationConfigService configService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private StreakService streakService;

    @Test
    void testServiceNotNull() {
        assertNotNull(streakService);
    }
}
