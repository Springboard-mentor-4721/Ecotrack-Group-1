package com.ecotrack.challenge;

import com.ecotrack.challenge.controller.ChallengeController;
import com.ecotrack.challenge.service.ChallengeService;
import com.ecotrack.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class ChallengeControllerTest {

    @Mock
    private ChallengeService challengeService;
    
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChallengeController controller;

    @Test
    void testControllerNotNull() {
        assertNotNull(controller);
    }
}
