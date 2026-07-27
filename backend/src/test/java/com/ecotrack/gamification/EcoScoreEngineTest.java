package com.ecotrack.gamification;

import com.ecotrack.gamification.engine.EcoScoreEngine;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import com.ecotrack.gamification.config.GamificationConfigService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class EcoScoreEngineTest {

    @Mock
    private UserGamificationProfileRepository profileRepository;

    @Mock
    private GamificationConfigService configService;

    @InjectMocks
    private EcoScoreEngine ecoScoreEngine;

    @Test
    void testEngineNotNull() {
        assertNotNull(ecoScoreEngine);
    }
}
