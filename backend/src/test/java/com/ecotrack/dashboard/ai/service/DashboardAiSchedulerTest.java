package com.ecotrack.dashboard.ai.service;

import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.tracking.service.CarbonEntryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardAiSchedulerTest {

    @Mock private DailyEcoTipService dailyEcoTipService;
    @Mock private TrendPredictionService trendPredictionService;
    @Mock private BehavioralInsightService behavioralInsightService;
    @Mock private UserRepository userRepository;
    @Mock private CarbonEntryService carbonEntryService;

    private DashboardAiScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new DashboardAiScheduler(dailyEcoTipService, trendPredictionService, behavioralInsightService, userRepository, carbonEntryService);
    }

    @Test
    void testGenerateDailyInsights() {
        User user = new User();
        user.setId(1L);
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(carbonEntryService.getRawJournalDataStringForUser(any(), any())).thenReturn("data");
        
        scheduler.generateDailyInsights();
        
        verify(dailyEcoTipService).scheduledGenerate(eq(1L), any());
        verify(trendPredictionService).scheduledGenerate(eq(1L), any());
    }

    @Test
    void testGenerateWeeklyInsights() {
        User user = new User();
        user.setId(1L);
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(carbonEntryService.getRawJournalDataStringForUser(any(), any())).thenReturn("data");
        
        scheduler.generateWeeklyInsights();
        
        verify(behavioralInsightService).scheduledGenerate(eq(1L), any());
    }
}
