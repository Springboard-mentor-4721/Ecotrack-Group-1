package com.ecotrack.gamification;

import com.ecotrack.gamification.config.GamificationConfigService;
import com.ecotrack.gamification.repository.GamificationConfigRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class GamificationConfigServiceTest {

    @Mock
    private GamificationConfigRepository configRepository;

    @InjectMocks
    private GamificationConfigService configService;

    @Test
    void testServiceNotNull() {
        assertNotNull(configService);
    }
}
