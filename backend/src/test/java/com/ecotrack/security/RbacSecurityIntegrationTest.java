package com.ecotrack.security;

import com.ecotrack.admin.dto.request.UpdateUserRoleRequest;
import com.ecotrack.admin.service.AdminService;
import com.ecotrack.common.enums.Role;
import com.ecotrack.common.enums.Status;
import com.ecotrack.gamification.entity.UserGamificationProfile;
import com.ecotrack.gamification.repository.UserGamificationProfileRepository;
import com.ecotrack.leaderboard.LeaderboardService;
import com.ecotrack.security.jwt.JwtService;
import com.ecotrack.user.entity.User;
import com.ecotrack.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RbacSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserGamificationProfileRepository profileRepository;

    @Autowired
    private LeaderboardService leaderboardService;

    @Autowired
    private ObjectMapper objectMapper;

    private String userToken;
    private String adminToken;
    private User testUser;
    private User testAdmin;

    @BeforeEach
    void setup() {
        testUser = new User();
        testUser.setName("Participant");
        testUser.setEmail("user_" + java.util.UUID.randomUUID() + "@example.com");
        testUser.setPasswordHash("password");
        testUser.setRole(Role.USER);
        testUser.setStatus(Status.ACTIVE);
        userRepository.save(testUser);

        testAdmin = new User();
        testAdmin.setName("Administrator");
        testAdmin.setEmail("admin_" + java.util.UUID.randomUUID() + "@example.com");
        testAdmin.setPasswordHash("password");
        testAdmin.setRole(Role.ADMIN);
        testAdmin.setStatus(Status.ACTIVE);
        userRepository.save(testAdmin);

        // Also create a second admin for the last-admin protection test
        User secondAdmin = new User();
        secondAdmin.setName("Administrator 2");
        secondAdmin.setEmail("admin2_" + java.util.UUID.randomUUID() + "@example.com");
        secondAdmin.setPasswordHash("password");
        secondAdmin.setRole(Role.ADMIN);
        secondAdmin.setStatus(Status.ACTIVE);
        userRepository.save(secondAdmin);

        userToken = "Bearer " + jwtService.generateToken(testUser);
        adminToken = "Bearer " + jwtService.generateToken(testAdmin);
    }

    // --- ADMIN TO PARTICIPANT API TESTS (Should be 403) ---

    @Test
    void test1_adminAttemptingCarbonEntryCreation_Returns403() throws Exception {
        mockMvc.perform(get("/api/carbon")
                .header("Authorization", adminToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void test2_adminAttemptingGoalDeletion_Returns403() throws Exception {
        mockMvc.perform(delete("/api/goals/1")
                .header("Authorization", adminToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void test3_adminAttemptingChallengeJoin_Returns403() throws Exception {
        mockMvc.perform(post("/api/challenges/1/join")
                .header("Authorization", adminToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void test4_adminAttemptingParticipantDashboard_Returns403() throws Exception {
        mockMvc.perform(get("/api/dashboard/user")
                .header("Authorization", adminToken))
                .andExpect(status().isForbidden());
    }

    // --- USER TO ADMIN API TESTS (Should be 403) ---

    @Test
    void test5_userAttemptingAdminUserManagement_Returns403() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", userToken))
                .andExpect(status().isForbidden());
    }

    // --- ADMIN TO ADMIN API TESTS (Should be 200/Success) ---

    @Test
    void test6_adminAttemptingAdminUserManagement_Succeeds() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", adminToken))
                .andExpect(status().isOk());
    }

    // --- ROLE MANAGEMENT TESTS ---

    @Test
    void test7_adminCannotDemoteSelf() throws Exception {
        UpdateUserRoleRequest req = new UpdateUserRoleRequest();
        req.setRole(Role.USER);

        mockMvc.perform(put("/api/admin/users/" + testAdmin.getId() + "/role")
                .header("Authorization", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void test8_cannotDemoteLastAdmin() throws Exception {
        java.util.List<User> admins = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).toList();
        // Delete all admins except testAdmin
        for (User admin : admins) {
            if (!admin.getId().equals(testAdmin.getId())) {
                userRepository.delete(admin);
            }
        }

        // We will test the service method directly to bypass self-demotion check for this test
        User attackerAdmin = new User();
        attackerAdmin.setId(999L);
        attackerAdmin.setEmail("attacker@example.com");
        
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            adminService.updateUserRole(attackerAdmin.getId(), testAdmin.getId(), Role.USER);
        });

        assertEquals("Cannot demote last admin", exception.getMessage());
    }

    // --- LEADERBOARD REGRESSION TEST ---

    @Test
    void test9_leaderboardExcludesAdmins() {
        // Give user some XP
        UserGamificationProfile userProfile = new UserGamificationProfile();
        userProfile.setUserId(testUser.getId());
        userProfile.setLifetimeEcoXp(500L);
        userProfile.setCurrentEcoScore(new java.math.BigDecimal("1.5"));
        profileRepository.save(userProfile);

        // Give admin some XP (even though V46 clears it, we test the query itself)
        UserGamificationProfile adminProfile = new UserGamificationProfile();
        adminProfile.setUserId(testAdmin.getId());
        adminProfile.setLifetimeEcoXp(1000L); // More XP than user
        adminProfile.setCurrentEcoScore(new java.math.BigDecimal("2.0"));
        profileRepository.save(adminProfile);

        var topUsers = profileRepository.findTop50ByOrderByLifetimeEcoXpDesc();
        
        // Assert that the user is in the leaderboard
        boolean userFound = topUsers.stream().anyMatch(p -> p.getUserId().equals(testUser.getId()));
        assertTrue(userFound, "USER should be in the leaderboard");

        // Assert that the admin is NOT in the leaderboard
        boolean adminFound = topUsers.stream().anyMatch(p -> p.getUserId().equals(testAdmin.getId()));
        assertFalse(adminFound, "ADMIN should be explicitly excluded from the leaderboard");
    }
}
