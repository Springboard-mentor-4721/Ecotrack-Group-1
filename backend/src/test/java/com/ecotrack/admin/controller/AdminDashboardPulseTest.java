package com.ecotrack.admin.controller;

import com.ecotrack.admin.dto.response.AdminDashboardPulseDTO;
import com.ecotrack.admin.service.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AdminDashboardPulseTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.ecotrack.security.jwt.JwtService jwtService;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @MockBean
    private AdminService adminService;

    @MockBean
    private com.ecotrack.user.repository.UserRepository userRepository;

    @MockBean
    private com.ecotrack.challenge.service.ChallengeService challengeService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetPulseAsAdmin_Returns200() throws Exception {
        AdminDashboardPulseDTO mockDto = AdminDashboardPulseDTO.builder()
                .totalUsers(150L)
                .activeChallengesCount(5L)
                .upcomingChallengesCount(2L)
                .build();

        when(adminService.getDashboardPulse()).thenReturn(mockDto);

        mockMvc.perform(get("/api/admin/dashboard/pulse"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(150))
                .andExpect(jsonPath("$.activeChallengesCount").value(5))
                .andExpect(jsonPath("$.upcomingChallengesCount").value(2));
    }
}
