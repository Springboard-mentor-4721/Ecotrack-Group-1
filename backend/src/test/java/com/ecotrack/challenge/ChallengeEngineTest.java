package com.ecotrack.challenge;

import com.ecotrack.challenge.service.ChallengeEngine;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class ChallengeEngineTest {

    @Mock
    private ChallengeParticipantRepository participantRepository;
    
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ChallengeEngine challengeEngine;

    @Test
    void testEngineNotNull() {
        assertNotNull(challengeEngine);
    }
}
