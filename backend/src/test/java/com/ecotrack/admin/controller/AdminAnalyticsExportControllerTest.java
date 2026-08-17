package com.ecotrack.admin.controller;

import com.ecotrack.admin.dto.analytics.*;
import com.ecotrack.admin.service.AdminAnalyticsService;
import com.ecotrack.admin.service.AdminCsvExportService;
import com.ecotrack.admin.service.AdminExcelExportService;
import com.ecotrack.admin.service.AdminPdfExportService;
import com.ecotrack.security.filter.JwtAuthenticationFilter;
import com.ecotrack.security.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminAnalyticsExportController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
public class AdminAnalyticsExportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminAnalyticsService adminAnalyticsService;

    @MockBean
    private AdminPdfExportService pdfService;

    @MockBean
    private AdminExcelExportService excelService;

    @MockBean
    private AdminCsvExportService csvService;


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

    @Test
    @WithMockUser(roles = "ADMIN")
    void testExportPdfAdmin() throws Exception {
        when(pdfService.exportPdf(any(), any(), any(), any(), any(), any(), any())).thenReturn(new byte[]{1, 2, 3});
        
        mockMvc.perform(get("/api/admin/analytics/export/pdf"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().exists("Content-Disposition"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testExportPdfUser() throws Exception {
        mockMvc.perform(get("/api/admin/analytics/export/pdf"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testExportPdfUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/analytics/export/pdf"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testExportExcelAdmin() throws Exception {
        when(excelService.exportExcel(any(), any(), any(), any(), any(), any(), any())).thenReturn(new byte[]{1, 2, 3});
        
        mockMvc.perform(get("/api/admin/analytics/export/excel"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")))
                .andExpect(header().exists("Content-Disposition"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testExportCsvAdmin() throws Exception {
        when(csvService.exportCsvZip(any(), any(), any(), any(), any(), any(), any())).thenReturn(new byte[]{1, 2, 3});
        
        mockMvc.perform(get("/api/admin/analytics/export/csv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.valueOf("application/zip")))
                .andExpect(header().exists("Content-Disposition"));
    }
}
