package com.ecotrack.admin.controller;

import com.ecotrack.admin.dto.analytics.*;
import com.ecotrack.admin.service.AdminAnalyticsService;
import com.ecotrack.admin.service.AdminCsvExportService;
import com.ecotrack.admin.service.AdminExcelExportService;
import com.ecotrack.admin.service.AdminPdfExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/analytics/export")
@RequiredArgsConstructor
public class AdminAnalyticsExportController {

    private final AdminAnalyticsService analyticsService;
    private final AdminPdfExportService pdfService;
    private final AdminExcelExportService excelService;
    private final AdminCsvExportService csvService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf(AdminAnalyticsFilter filter, @RequestParam(defaultValue = "EMERALD") String theme) {
        com.ecotrack.report.design.ReportTheme reportTheme;
        try {
            reportTheme = com.ecotrack.report.design.ReportTheme.fromId(theme);
        } catch (IllegalArgumentException e) {
            reportTheme = com.ecotrack.report.design.ReportTheme.EMERALD;
        }
        byte[] pdf = pdfService.exportPdf(
                filter,
                analyticsService.getOverview(),
                analyticsService.getUserAnalytics(filter),
                analyticsService.getGamificationAnalytics(filter),
                analyticsService.getBadgeAnalytics(filter),
                analyticsService.getChallengeAnalytics(filter),
                analyticsService.getSustainabilityAnalytics(filter),
                reportTheme
        );
        String filename = "ecotrack-admin-analytics-" + LocalDate.now() + ".pdf";
        return createFileResponse(pdf, filename, MediaType.APPLICATION_PDF);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportExcel(AdminAnalyticsFilter filter, @RequestParam(defaultValue = "EMERALD") String theme) {
        com.ecotrack.report.design.ReportTheme reportTheme;
        try {
            reportTheme = com.ecotrack.report.design.ReportTheme.fromId(theme);
        } catch (IllegalArgumentException e) {
            reportTheme = com.ecotrack.report.design.ReportTheme.EMERALD;
        }
        byte[] excel = excelService.exportExcel(
                filter,
                analyticsService.getOverview(),
                analyticsService.getUserAnalytics(filter),
                analyticsService.getGamificationAnalytics(filter),
                analyticsService.getBadgeAnalytics(filter),
                analyticsService.getChallengeAnalytics(filter),
                analyticsService.getSustainabilityAnalytics(filter),
                reportTheme
        );
        String filename = "ecotrack-admin-analytics-" + LocalDate.now() + ".xlsx";
        return createFileResponse(excel, filename, MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportCsv(AdminAnalyticsFilter filter) {
        byte[] zip = csvService.exportCsvZip(
                filter,
                analyticsService.getOverview(),
                analyticsService.getUserAnalytics(filter),
                analyticsService.getGamificationAnalytics(filter),
                analyticsService.getBadgeAnalytics(filter),
                analyticsService.getChallengeAnalytics(filter),
                analyticsService.getSustainabilityAnalytics(filter)
        );
        String filename = "ecotrack-admin-analytics-" + LocalDate.now() + ".zip";
        return createFileResponse(zip, filename, MediaType.valueOf("application/zip"));
    }

    private ResponseEntity<byte[]> createFileResponse(byte[] content, String filename, MediaType mediaType) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }
}
