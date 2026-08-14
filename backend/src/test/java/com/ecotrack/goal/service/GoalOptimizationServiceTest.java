package com.ecotrack.goal.service;

import com.ecotrack.goal.dto.GoalOptimizationResponse;
import com.ecotrack.goal.dto.GoalRequest;
import com.ecotrack.goal.entity.enums.GoalType;
import com.ecotrack.tracking.repository.CarbonEntryRepository;
import com.ecotrack.tracking.repository.projection.SubCategoryVolumeProjection;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import org.mockito.Answers;

@ExtendWith(MockitoExtension.class)
class GoalOptimizationServiceTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient chatClient;

    @Mock
    private CarbonEntryRepository carbonEntryRepository;

    private ObjectMapper objectMapper = new ObjectMapper();

    private GoalOptimizationService goalOptimizationService;

    @BeforeEach
    void setUp() {
        goalOptimizationService = new GoalOptimizationService(chatClient, carbonEntryRepository, objectMapper);
    }

    @Test
    void testOptimizeGoal_Success() throws Exception {
        Long userId = 1L;
        GoalRequest request = GoalRequest.builder()
                .goalType(GoalType.REDUCE_CARBON_EMISSIONS)
                .title("Test Goal")
                .targetValue(BigDecimal.valueOf(100))
                .unit("kg CO2e")
                .targetDate(LocalDate.now().plusMonths(1))
                .build();

        SubCategoryVolumeProjection projection = mock(SubCategoryVolumeProjection.class);
        when(projection.getCategoryCode()).thenReturn("TRANSPORT");
        when(projection.getSubCategoryName()).thenReturn("Car");
        when(projection.getTotalValue()).thenReturn(BigDecimal.valueOf(200));

        when(carbonEntryRepository.getTopSubCategoriesByVolume(eq(userId), any(), any(Pageable.class)))
                .thenReturn(List.of(projection));

        String validJsonResponse = "{\"feasibility\": \"ACHIEVABLE\", \"suggestedTarget\": 90, \"explanation\": \"Looks good.\"}";
        when(chatClient.prompt().system(any(String.class)).user(any(String.class)).call().content())
                .thenReturn(validJsonResponse);

        GoalOptimizationResponse response = goalOptimizationService.optimizeGoal(userId, request);

        assertNotNull(response);
        assertEquals("ACHIEVABLE", response.getFeasibility());
        assertEquals(BigDecimal.valueOf(90), response.getSuggestedTarget());
    }

    @Test
    void testOptimizeGoal_EmptyHistory() {
        Long userId = 1L;
        GoalRequest request = new GoalRequest();

        when(carbonEntryRepository.getTopSubCategoriesByVolume(eq(userId), any(), any(Pageable.class)))
                .thenReturn(Collections.emptyList());

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            goalOptimizationService.optimizeGoal(userId, request);
        });

        assertEquals("Not enough recent activity data to provide a reliable optimization.", ex.getMessage());
    }

    @Test
    void testOptimizeGoal_AiFailure() {
        Long userId = 1L;
        GoalRequest request = GoalRequest.builder()
                .goalType(GoalType.REDUCE_CARBON_EMISSIONS)
                .title("Test Goal")
                .targetValue(BigDecimal.valueOf(100))
                .unit("kg CO2e")
                .targetDate(LocalDate.now().plusMonths(1))
                .build();

        SubCategoryVolumeProjection projection = mock(SubCategoryVolumeProjection.class);
        when(carbonEntryRepository.getTopSubCategoriesByVolume(eq(userId), any(), any(Pageable.class)))
                .thenReturn(List.of(projection));

        when(chatClient.prompt().system(any(String.class)).user(any(String.class)).call().content())
                .thenThrow(new RuntimeException("AI Error"));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            goalOptimizationService.optimizeGoal(userId, request);
        });

        assertTrue(ex.getMessage().contains("AI optimization is temporarily unavailable"));
    }
    
    @Test
    void testOptimizeGoal_InvalidFeasibility() {
        Long userId = 1L;
        GoalRequest request = GoalRequest.builder()
                .goalType(GoalType.REDUCE_CARBON_EMISSIONS)
                .title("Test Goal")
                .targetValue(BigDecimal.valueOf(100))
                .unit("kg CO2e")
                .targetDate(LocalDate.now().plusMonths(1))
                .build();

        SubCategoryVolumeProjection projection = mock(SubCategoryVolumeProjection.class);
        when(carbonEntryRepository.getTopSubCategoriesByVolume(eq(userId), any(), any(Pageable.class)))
                .thenReturn(List.of(projection));

        String invalidJsonResponse = "{\"feasibility\": \"IMPOSSIBLE\", \"suggestedTarget\": 90, \"explanation\": \"Bad.\"}";
        when(chatClient.prompt().system(any(String.class)).user(any(String.class)).call().content())
                .thenReturn(invalidJsonResponse);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            goalOptimizationService.optimizeGoal(userId, request);
        });

        assertEquals("AI returned an invalid feasibility value.", ex.getMessage());
    }
}
