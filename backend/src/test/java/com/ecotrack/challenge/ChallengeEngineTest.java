package com.ecotrack.challenge;

import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.entity.ChallengeParticipant;
import com.ecotrack.challenge.enums.ChallengeEvaluationType;
import com.ecotrack.challenge.enums.ChallengeParticipantStatus;
import com.ecotrack.challenge.enums.ProgressMetric;
import com.ecotrack.challenge.enums.TrackingMethod;
import com.ecotrack.challenge.repository.ChallengeParticipantRepository;
import com.ecotrack.challenge.repository.ChallengeRepository;
import com.ecotrack.challenge.service.ChallengeEngine;
import com.ecotrack.challenge.strategy.ChallengeEvaluationStrategy;
import com.ecotrack.challenge.strategy.StrategyResolver;
import com.ecotrack.event.CarbonEntryCreatedEvent;
import com.ecotrack.event.CarbonEntryDeletedEvent;
import com.ecotrack.event.CarbonEntryUpdatedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChallengeEngineTest {

    @Mock
    private ChallengeParticipantRepository participantRepository;
    
    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;
    
    @Mock
    private StrategyResolver strategyResolver;

    @InjectMocks
    private ChallengeEngine challengeEngine;

    private Challenge challenge;
    private ChallengeParticipant participant;

    @BeforeEach
    void setUp() {
        challenge = new Challenge();
        challenge.setId(1L);
        challenge.setTrackingMethod(TrackingMethod.AUTOMATIC);
        challenge.setChallengeEvaluationType(ChallengeEvaluationType.ACHIEVEMENT);
        challenge.setProgressMetric(ProgressMetric.CARBON_EMISSION);
        challenge.setTargetValue(50);
        challenge.setLinkedCategoryId(100L);

        participant = new ChallengeParticipant();
        participant.setId(1L);
        participant.setUserId(1L);
        participant.setChallenge(challenge);
        participant.setProgress(BigDecimal.ZERO);
        participant.setStatus(ChallengeParticipantStatus.ACTIVE);
    }

    @Test
    void testProcessNewEntry_CarbonEmission() {
        CarbonEntryCreatedEvent event = new CarbonEntryCreatedEvent(1L, 1L, 100L, 1L, BigDecimal.valueOf(5.0), BigDecimal.valueOf(10.5), java.util.UUID.randomUUID().toString());
        
        List<ChallengeParticipant> list = new ArrayList<>();
        list.add(participant);
        when(participantRepository.findByUserIdAndStatusIn(eq(1L), any())).thenReturn(list);
        when(participantRepository.findByChallengeIdAndUserIdForUpdate(1L, 1L)).thenReturn(Optional.of(participant));
        
        ChallengeEvaluationStrategy strategy = mock(ChallengeEvaluationStrategy.class);
        when(strategyResolver.resolve(any())).thenReturn(strategy);
        when(strategy.evaluateLiveStatus(anyDouble(), anyDouble(), any())).thenReturn(ChallengeParticipantStatus.ACTIVE);

        challengeEngine.handleCarbonEntryCreated(event);

        ArgumentCaptor<ChallengeParticipant> captor = ArgumentCaptor.forClass(ChallengeParticipant.class);
        verify(participantRepository).save(captor.capture());

        assertEquals(BigDecimal.valueOf(10.5), captor.getValue().getProgress());
    }

    @Test
    void testProcessNewEntry_Quantity() {
        challenge.setProgressMetric(ProgressMetric.QUANTITY);
        CarbonEntryCreatedEvent event = new CarbonEntryCreatedEvent(1L, 1L, 100L, 1L, BigDecimal.valueOf(5.0), BigDecimal.valueOf(10.5), java.util.UUID.randomUUID().toString());
        
        List<ChallengeParticipant> list = new ArrayList<>();
        list.add(participant);
        when(participantRepository.findByUserIdAndStatusIn(eq(1L), any())).thenReturn(list);
        when(participantRepository.findByChallengeIdAndUserIdForUpdate(1L, 1L)).thenReturn(Optional.of(participant));
        
        ChallengeEvaluationStrategy strategy = mock(ChallengeEvaluationStrategy.class);
        when(strategyResolver.resolve(any())).thenReturn(strategy);
        when(strategy.evaluateLiveStatus(anyDouble(), anyDouble(), any())).thenReturn(ChallengeParticipantStatus.ACTIVE);

        challengeEngine.handleCarbonEntryCreated(event);

        ArgumentCaptor<ChallengeParticipant> captor = ArgumentCaptor.forClass(ChallengeParticipant.class);
        verify(participantRepository).save(captor.capture());

        assertEquals(BigDecimal.valueOf(5.0), captor.getValue().getProgress());
    }
}
