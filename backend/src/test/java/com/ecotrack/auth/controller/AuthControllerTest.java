package com.ecotrack.auth.controller;

import com.ecotrack.auth.dto.AuthResponse;
import com.ecotrack.auth.dto.ForgotPasswordRequest;
import com.ecotrack.auth.dto.LoginRequest;
import com.ecotrack.auth.dto.RegisterRequest;
import com.ecotrack.auth.dto.ResetPasswordRequest;
import com.ecotrack.auth.service.AuthService;
import com.ecotrack.common.exception.GlobalExceptionHandler;
import com.ecotrack.security.filter.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, com.ecotrack.security.config.SecurityConfig.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private com.ecotrack.user.repository.UserRepository userRepository;

    @MockBean
    private com.ecotrack.security.oauth2.CustomOAuth2UserService customOAuth2UserService;

    @MockBean
    private com.ecotrack.security.oauth2.OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockBean
    private com.ecotrack.security.oauth2.OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void register_ValidRequest_Returns201() throws Exception {
        RegisterRequest request = new RegisterRequest("Test User", "test@example.com", "password123");

        Mockito.doNothing().when(authService).register(any(RegisterRequest.class));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("User registered successfully"));
    }

    @Test
    void register_EmptyBody_Returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Malformed or empty JSON request"));
    }

    @Test
    void register_BlankFields_Returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("", "", "");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    void register_InvalidEmail_Returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("Test User", "invalid-email", "password123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.email").value("Must be a valid email address"));
    }

    @Test
    void register_DuplicateEmail_Returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("Test User", "test@example.com", "password123");

        Mockito.doThrow(new IllegalArgumentException("Email is already registered")).when(authService).register(any(RegisterRequest.class));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.error").value("Email is already registered"));
    }

    @Test
    void login_ValidRequest_Returns200() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "password123");
        AuthResponse response = new AuthResponse("mock-jwt-token", "Login successful");

        Mockito.doReturn(response).when(authService).login(any(LoginRequest.class));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock-jwt-token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.message").value("Login successful"));
    }

    @Test
    void login_InvalidCredentials_Returns401() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "wrongpassword");

        Mockito.doThrow(new org.springframework.security.authentication.BadCredentialsException("Invalid email or password")).when(authService).login(any(LoginRequest.class));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void login_SuspendedAccount_Returns403() throws Exception {
        LoginRequest request = new LoginRequest("suspended@example.com", "password123");

        Mockito.doThrow(new org.springframework.security.authentication.DisabledException("Account suspended")).when(authService).login(any(LoginRequest.class));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Account suspended"));
    }
    @Test
    void forgotPassword_ValidRequest_Returns200() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("test@example.com");

        Mockito.doNothing().when(authService).requestPasswordReset(any(ForgotPasswordRequest.class));

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If an account with that email exists, a password reset link has been sent."));
    }

    @Test
    void forgotPassword_NonExistentEmail_Returns200() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("nonexistent@example.com");

        Mockito.doNothing().when(authService).requestPasswordReset(any(ForgotPasswordRequest.class));

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If an account with that email exists, a password reset link has been sent."));
    }

    @Test
    void resetPassword_ValidRequest_Returns200() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest("valid-token", "newpassword123");

        Mockito.doNothing().when(authService).resetPassword(any(ResetPasswordRequest.class));

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password has been reset successfully"));
    }

    @Test
    void resetPassword_InvalidToken_Returns400() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest("invalid-token", "newpassword123");

        Mockito.doThrow(new IllegalArgumentException("Invalid token")).when(authService).resetPassword(any(ResetPasswordRequest.class));

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.error").value("Invalid token"));
    }

    @Test
    void resetPassword_ExpiredToken_Returns400() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest("expired-token", "newpassword123");

        Mockito.doThrow(new IllegalArgumentException("Token has expired or already been used")).when(authService).resetPassword(any(ResetPasswordRequest.class));

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.error").value("Token has expired or already been used"));
    }
}
