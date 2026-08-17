package com.ecotrack.admin.controller;

import com.ecotrack.admin.dto.analytics.AdminOverviewAnalyticsDTO;
import com.ecotrack.admin.service.AdminAnalyticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminAnalyticsController.class)
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import({com.ecotrack.security.config.SecurityConfig.class, com.ecotrack.security.filter.JwtAuthenticationFilter.class})
public class AdminAnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminAnalyticsService adminAnalyticsService;

    @MockBean
    private com.ecotrack.security.jwt.JwtService jwtService;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @MockBean
    private com.ecotrack.user.repository.UserRepository userRepository;

    @MockBean
    private com.ecotrack.security.oauth2.CustomOAuth2UserService customOAuth2UserService;

    @MockBean
    private com.ecotrack.security.oauth2.OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockBean
    private com.ecotrack.security.oauth2.OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    // We disable filters to just test the method security annotations if we want, or we can use full context.
    // For a simple mockMvc test with @WithMockUser on the methods, let's keep it simple.

    // Note: since this is just a stub for verifying method signatures, the actual @PreAuthorize 
    // requires a full integration test to work properly if we disable filters. 
    // We'll write a simple test to ensure compilation and basic wiring.

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings = {
        "/api/admin/analytics/overview",
        "/api/admin/analytics/users",
        "/api/admin/analytics/gamification",
        "/api/admin/analytics/badges",
        "/api/admin/analytics/challenges",
        "/api/admin/analytics/sustainability"
    })
    @WithMockUser(roles = "ADMIN")
    void allEndpoints_AsAdmin_Returns200(String endpoint) throws Exception {
        when(adminAnalyticsService.getOverview()).thenReturn(new AdminOverviewAnalyticsDTO());
        when(adminAnalyticsService.getUserAnalytics(any())).thenReturn(new com.ecotrack.admin.dto.analytics.AdminUserAnalyticsDTO());
        when(adminAnalyticsService.getGamificationAnalytics(any())).thenReturn(new com.ecotrack.admin.dto.analytics.AdminGamificationAnalyticsDTO());
        when(adminAnalyticsService.getBadgeAnalytics(any())).thenReturn(new com.ecotrack.admin.dto.analytics.AdminBadgeAnalyticsDTO());
        when(adminAnalyticsService.getChallengeAnalytics(any())).thenReturn(new com.ecotrack.admin.dto.analytics.AdminChallengeAnalyticsDTO());
        when(adminAnalyticsService.getSustainabilityAnalytics(any())).thenReturn(new com.ecotrack.admin.dto.analytics.AdminSustainabilityAnalyticsDTO());

        mockMvc.perform(get(endpoint))
               .andExpect(status().isOk());
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings = {
        "/api/admin/analytics/overview",
        "/api/admin/analytics/users",
        "/api/admin/analytics/gamification",
        "/api/admin/analytics/badges",
        "/api/admin/analytics/challenges",
        "/api/admin/analytics/sustainability"
    })
    @WithMockUser(roles = "USER")
    void allEndpoints_AsUser_Returns403(String endpoint) throws Exception {
        mockMvc.perform(get(endpoint))
               .andExpect(status().isForbidden());
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings = {
        "/api/admin/analytics/overview",
        "/api/admin/analytics/users",
        "/api/admin/analytics/gamification",
        "/api/admin/analytics/badges",
        "/api/admin/analytics/challenges",
        "/api/admin/analytics/sustainability"
    })
    void allEndpoints_Unauthenticated_Returns401(String endpoint) throws Exception {
        mockMvc.perform(get(endpoint))
               .andExpect(status().isUnauthorized());
    }
}
