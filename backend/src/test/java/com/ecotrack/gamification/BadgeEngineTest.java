package com.ecotrack.gamification;

import com.ecotrack.gamification.engine.BadgeEngine;
import com.ecotrack.gamification.repository.BadgeRepository;
import com.ecotrack.gamification.repository.UserBadgeRepository;
import com.ecotrack.gamification.repository.BadgeProgressRepository;
import com.ecotrack.gamification.service.XpLedgerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class BadgeEngineTest {

    @Mock
    private BadgeRepository badgeRepository;

    @Mock
    private UserBadgeRepository userBadgeRepository;

    @Mock
    private BadgeProgressRepository badgeProgressRepository;

    @Mock
    private XpLedgerService xpLedgerService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private BadgeEngine badgeEngine;

    @Test
    void testEngineNotNull() {
        assertNotNull(badgeEngine);
    }
}
