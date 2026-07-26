package com.ecotrack.user.controller;

import com.ecotrack.security.jwt.JwtService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private com.ecotrack.security.oauth2.CustomOAuth2UserService customOAuth2UserService;

    @MockBean
    private com.ecotrack.security.oauth2.OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockBean
    private com.ecotrack.security.oauth2.OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    @Test
    void getCurrentUser_MissingJwt_Returns401() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized()); 
    }

    @Test
    void getCurrentUser_InvalidJwt_Returns401() throws Exception {
        Mockito.when(jwtService.extractUsername(anyString())).thenThrow(new RuntimeException("Invalid token"));

        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getCurrentUser_ValidJwt_Returns200() throws Exception {
        String token = "valid-token";
        String email = "test@example.com";
        
        UserDetails mockUserDetails = org.springframework.security.core.userdetails.User.withUsername(email)
                .password("password")
                .authorities("ROLE_USER")
                .build();

        Mockito.when(jwtService.extractUsername(token)).thenReturn(email);
        Mockito.when(userDetailsService.loadUserByUsername(email)).thenReturn(mockUserDetails);
        Mockito.when(jwtService.validateToken(token, email)).thenReturn(true);

        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Authenticated as: " + email));
    }
}
