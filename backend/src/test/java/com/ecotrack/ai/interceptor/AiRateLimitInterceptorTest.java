package com.ecotrack.ai.interceptor;

import com.ecotrack.ai.config.EcoTrackAiProperties;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;

import java.io.PrintWriter;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class AiRateLimitInterceptorTest {

    private AiRateLimitInterceptor interceptor;
    private UserRepository userRepository;
    private EcoTrackAiProperties aiProperties;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        ObjectMapper objectMapper = new ObjectMapper();

        EcoTrackAiProperties.Features features = new EcoTrackAiProperties.Features(true, true, true);
        EcoTrackAiProperties.Models models = new EcoTrackAiProperties.Models("gemini-3.5-flash-lite", "gemini-3.5-flash-lite", "gemini-3.5-flash-lite", "gemini-3.5-flash-lite", "gemini-3.5-flash-lite", "gemini-3.5-flash-lite");
        EcoTrackAiProperties.Timeouts timeouts = new EcoTrackAiProperties.Timeouts(8, 1);
        EcoTrackAiProperties.Cache cache = new EcoTrackAiProperties.Cache(24, 24, 7, 30, 7, 24);
        EcoTrackAiProperties.RateLimit rateLimit = new EcoTrackAiProperties.RateLimit(10);
        EcoTrackAiProperties.ManualRateLimit manualRateLimit = new EcoTrackAiProperties.ManualRateLimit(true, 2);
        
        aiProperties = new EcoTrackAiProperties(true, features, models, timeouts, cache, rateLimit, manualRateLimit);
        interceptor = new AiRateLimitInterceptor(aiProperties, userRepository, objectMapper);

        User user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        User user2 = new User();
        user2.setId(2L);
        user2.setEmail("test2@test.com");
        when(userRepository.findByEmail("test2@test.com")).thenReturn(Optional.of(user2));

        SecurityContextImpl context = new SecurityContextImpl();
        context.setAuthentication(new UsernamePasswordAuthenticationToken("test@test.com", "", java.util.Collections.emptyList()));
        SecurityContextHolder.setContext(context);
    }

    @Test
    void testFirstRequestAllowed() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean result = interceptor.preHandle(request, response, null);
        assertTrue(result);
    }

    @Test
    void testRequestOverLimitReturns429() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertTrue(interceptor.preHandle(request, response, null)); // 1
        assertTrue(interceptor.preHandle(request, response, null)); // 2
        
        assertFalse(interceptor.preHandle(request, response, null)); // 3
        assertEquals(429, response.getStatus());
        assertTrue(response.getContentAsString().contains("AI request limit reached"));
    }

    @Test
    void testSeparateUsersHaveIndependentLimits() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertTrue(interceptor.preHandle(request, response, null)); // user 1
        assertTrue(interceptor.preHandle(request, response, null)); // user 1
        assertFalse(interceptor.preHandle(request, response, null)); // user 1

        SecurityContextImpl context = new SecurityContextImpl();
        context.setAuthentication(new UsernamePasswordAuthenticationToken("test2@test.com", "", java.util.Collections.emptyList()));
        SecurityContextHolder.setContext(context);

        assertTrue(interceptor.preHandle(request, response, null)); // user 2
        assertTrue(interceptor.preHandle(request, response, null)); // user 2
    }

    @Test
    void testDisabledLimiterAllowsRequests() throws Exception {
        EcoTrackAiProperties.ManualRateLimit manualRateLimit = new EcoTrackAiProperties.ManualRateLimit(false, 2);
        EcoTrackAiProperties disabledProps = new EcoTrackAiProperties(true, aiProperties.features(), aiProperties.models(), aiProperties.timeouts(), aiProperties.cache(), aiProperties.rateLimit(), manualRateLimit);
        AiRateLimitInterceptor disabledInterceptor = new AiRateLimitInterceptor(disabledProps, userRepository, new ObjectMapper());

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertTrue(disabledInterceptor.preHandle(request, response, null));
        assertTrue(disabledInterceptor.preHandle(request, response, null));
        assertTrue(disabledInterceptor.preHandle(request, response, null)); // 3rd still allowed
    }

    @Test
    void testGetRequestsNotLimited() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertTrue(interceptor.preHandle(request, response, null));
        assertTrue(interceptor.preHandle(request, response, null));
        assertTrue(interceptor.preHandle(request, response, null));
    }
}
