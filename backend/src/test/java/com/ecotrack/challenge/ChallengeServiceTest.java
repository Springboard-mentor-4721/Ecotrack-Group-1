package com.ecotrack.challenge;

import com.ecotrack.challenge.service.ChallengeService;
import com.ecotrack.challenge.repository.ChallengeRepository;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class ChallengeServiceTest {

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private ChallengeParticipantRepository participantRepository;

    @InjectMocks
    private ChallengeService challengeService;

    @Test
    void testServiceNotNull() {
        assertNotNull(challengeService);
    }
}
