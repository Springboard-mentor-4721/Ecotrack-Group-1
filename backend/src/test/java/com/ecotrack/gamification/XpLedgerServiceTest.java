package com.ecotrack.gamification;

import com.ecotrack.gamification.service.XpLedgerService;
import com.ecotrack.gamification.repository.XpLedgerRepository;
import com.ecotrack.gamification.config.GamificationConfigService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class XpLedgerServiceTest {

    @Mock
    private XpLedgerRepository xpLedgerRepository;

    @Mock
    private GamificationConfigService configService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private XpLedgerService xpLedgerService;

    @Test
    void testServiceNotNull() {
        assertNotNull(xpLedgerService);
    }
}
