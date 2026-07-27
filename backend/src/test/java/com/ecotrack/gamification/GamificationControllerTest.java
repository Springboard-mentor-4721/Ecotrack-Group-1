package com.ecotrack.gamification;

import com.ecotrack.gamification.controller.GamificationController;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import com.ecotrack.gamification.repository.BadgeRepository;
import com.ecotrack.gamification.repository.UserBadgeRepository;
import com.ecotrack.gamification.repository.XpLedgerRepository;
import com.ecotrack.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class GamificationControllerTest {

    @Mock
    private UserGamificationProfileRepository profileRepository;

    @Mock
    private BadgeRepository badgeRepository;

    @Mock
    private UserBadgeRepository userBadgeRepository;

    @Mock
    private XpLedgerRepository xpLedgerRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GamificationController controller;

    @Test
    void testControllerNotNull() {
        assertNotNull(controller);
    }
}
