package com.ecotrack.report.controller;

import com.ecotrack.report.dto.CarbonReportDTO;
import com.ecotrack.report.dto.ChallengeReportDTO;
import com.ecotrack.report.dto.ExportFormat;
import com.ecotrack.report.dto.GoalReportDTO;
import com.ecotrack.report.dto.SustainabilityReportDTO;
import com.ecotrack.report.service.ExcelExportService;
import com.ecotrack.report.service.PdfExportService;
import com.ecotrack.report.service.ReportService;
import com.ecotrack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final PdfExportService pdfExportService;
    private final ExcelExportService excelExportService;
    private final UserRepository userRepository;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/carbon")
    public ResponseEntity<?> getCarbonReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "JSON") ExportFormat format,
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        CarbonReportDTO report = reportService.getCarbonReport(userId, startDate, endDate);

        if (format == ExportFormat.PDF) {
            byte[] pdf = pdfExportService.exportCarbonReport(report);
            return createFileResponse(pdf, "ecotrack-carbon-report-" + startDate + "-to-" + endDate + ".pdf", MediaType.APPLICATION_PDF);
        } else if (format == ExportFormat.EXCEL) {
            byte[] excel = excelExportService.exportCarbonReport(report);
            return createFileResponse(excel, "ecotrack-carbon-report-" + startDate + "-to-" + endDate + ".xlsx", MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        }

        return ResponseEntity.ok(report);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/goals")
    public ResponseEntity<?> getGoalReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "JSON") ExportFormat format,
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        GoalReportDTO report = reportService.getGoalReport(userId, startDate, endDate);

        if (format == ExportFormat.PDF) {
            byte[] pdf = pdfExportService.exportGoalReport(report);
            return createFileResponse(pdf, "ecotrack-goals-report-" + startDate + "-to-" + endDate + ".pdf", MediaType.APPLICATION_PDF);
        } else if (format == ExportFormat.EXCEL) {
            byte[] excel = excelExportService.exportGoalReport(report);
            return createFileResponse(excel, "ecotrack-goals-report-" + startDate + "-to-" + endDate + ".xlsx", MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        }

        return ResponseEntity.ok(report);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/challenges")
    public ResponseEntity<?> getChallengeReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "JSON") ExportFormat format,
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        ChallengeReportDTO report = reportService.getChallengeReport(userId, startDate, endDate);

        if (format == ExportFormat.PDF) {
            byte[] pdf = pdfExportService.exportChallengeReport(report);
            return createFileResponse(pdf, "ecotrack-challenges-report-" + startDate + "-to-" + endDate + ".pdf", MediaType.APPLICATION_PDF);
        } else if (format == ExportFormat.EXCEL) {
            byte[] excel = excelExportService.exportChallengeReport(report);
            return createFileResponse(excel, "ecotrack-challenges-report-" + startDate + "-to-" + endDate + ".xlsx", MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        }

        return ResponseEntity.ok(report);
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/sustainability")
    public ResponseEntity<?> getSustainabilityReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "JSON") ExportFormat format,
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        SustainabilityReportDTO report = reportService.getSustainabilityReport(userId, startDate, endDate);

        if (format == ExportFormat.PDF) {
            byte[] pdf = pdfExportService.exportSustainabilityReport(report);
            return createFileResponse(pdf, "ecotrack-sustainability-report-" + startDate + "-to-" + endDate + ".pdf", MediaType.APPLICATION_PDF);
        } else if (format == ExportFormat.EXCEL) {
            byte[] excel = excelExportService.exportSustainabilityReport(report);
            return createFileResponse(excel, "ecotrack-sustainability-report-" + startDate + "-to-" + endDate + ".xlsx", MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        }

        return ResponseEntity.ok(report);
    }

    private ResponseEntity<byte[]> createFileResponse(byte[] content, String filename, MediaType mediaType) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"))
                .getId();
    }
}
