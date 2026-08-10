package com.ecotrack.dashboard.ai.service;

import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import com.ecotrack.tracking.service.CarbonEntryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DashboardAiSchedulerTest {

    private DashboardAiScheduler scheduler;
    private DailyEcoTipService dailyEcoTipService;
    private UserRepository userRepository;
    private CarbonEntryService carbonEntryService;

    @BeforeEach
    void setUp() {
        dailyEcoTipService = mock(DailyEcoTipService.class);
        userRepository = mock(UserRepository.class);
        carbonEntryService = mock(CarbonEntryService.class);

        scheduler = new DashboardAiScheduler(
                dailyEcoTipService,
                userRepository,
                carbonEntryService
        );
    }

    @Test
    void testGenerateDailyInsights() {
        User user1 = new User();
        user1.setId(1L);
        User user2 = new User();
        user2.setId(2L);

        when(userRepository.findAll()).thenReturn(List.of(user1, user2));
        when(carbonEntryService.getRawJournalDataStringForUser(any(), any())).thenReturn("Test Data");

        // Use a background thread or similar to avoid sleep blocking test if it was real,
        // but for now we just verify the call.
        scheduler.generateDailyInsights();

        verify(dailyEcoTipService, times(1)).scheduledGenerate(eq(1L), any());
        verify(dailyEcoTipService, times(1)).scheduledGenerate(eq(2L), any());
    }
}
