package com.ecotrack.challenge;

import com.ecotrack.challenge.service.ChallengeLifecycleScheduler;
import com.ecotrack.challenge.repository.ChallengeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class ChallengeLifecycleSchedulerTest {

    @Mock
    private ChallengeRepository challengeRepository;

    @InjectMocks
    private ChallengeLifecycleScheduler scheduler;

    @Test
    void testSchedulerNotNull() {
        assertNotNull(scheduler);
    }
}
