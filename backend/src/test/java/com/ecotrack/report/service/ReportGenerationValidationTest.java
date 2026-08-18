package com.ecotrack.report.service;

import com.ecotrack.report.dto.*;
import org.junit.jupiter.api.Test;
import java.io.File;
import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class ReportGenerationValidationTest {

    private final com.ecotrack.report.design.ReportChartService chartService = new com.ecotrack.report.design.ReportChartService();
    private final PdfExportService pdfExportService = new PdfExportService(chartService);
    private final ExcelExportService excelExportService = new ExcelExportService();
    private final CsvExportService csvExportService = new CsvExportService();

    @Test
    public void generateAllReports() throws Exception {
        File dir = new File("target/reports");
        if (!dir.exists()) dir.mkdirs();

        // 1. Mock Data Setup
        CarbonReportDTO carbonDTO = CarbonReportDTO.builder()
                .startDate("2026-08-01").endDate("2026-08-31")
                .userName("John Doe").userEmail("john@example.com")
                .totalEmissions(new BigDecimal("125.5"))
                .emissionsByCategory(Map.of("Transport", new BigDecimal("100"), "Energy", new BigDecimal("25.5")))
                .entries(List.of(
                        CarbonReportDTO.CarbonEntryDetail.builder().date("2026-08-10").category("TRANSPORT").subCategory("CAR").emission(new BigDecimal("50.0")).description("Drive to work").build(),
                        CarbonReportDTO.CarbonEntryDetail.builder().date("2026-08-12").category("ENERGY").subCategory("ELECTRICITY").emission(new BigDecimal("25.5")).description("Home Power").build()
                )).build();

        GoalReportDTO goalDTO = GoalReportDTO.builder()
                .startDate("2026-08-01").endDate("2026-08-31")
                .userName("John Doe").userEmail("john@example.com")
                .totalGoals(3).activeGoals(1).completedGoals(1).failedGoals(1)
                .goals(List.of(
                        GoalReportDTO.GoalDetail.builder().title("Reduce Energy").type("REDUCE_ELECTRICITY_CONSUMPTION").status("IN_PROGRESS").progressPercentage(new BigDecimal("50.0")).targetDate("2026-12-31").build(),
                        GoalReportDTO.GoalDetail.builder().title("Plant Trees").type("PLANT_TREES").status("COMPLETED").progressPercentage(new BigDecimal("100.0")).targetDate("2026-08-15").build()
                )).build();

        ChallengeReportDTO challengeDTO = ChallengeReportDTO.builder()
                .startDate("2026-08-01").endDate("2026-08-31")
                .userName("John Doe").userEmail("john@example.com")
                .totalParticipated(2).completedChallenges(1).totalXpEarned(500)
                .challenges(List.of(
                        ChallengeReportDTO.ChallengeDetail.builder().title("Vegan Week").category("DIET").status("COMPLETED").progressPercentage(100.0).xpEarned(500).joinedDate("2026-08-01").completedDate("2026-08-07").build(),
                        ChallengeReportDTO.ChallengeDetail.builder().title("Walk to Work").category("TRANSPORT").status("IN_PROGRESS").progressPercentage(50.0).xpEarned(0).joinedDate("2026-08-10").build()
                )).build();

        SustainabilityReportDTO overallDTO = SustainabilityReportDTO.builder()
                .startDate("2026-08-01").endDate("2026-08-31")
                .userName("John Doe").userEmail("john@example.com")
                .carbonReport(carbonDTO).goalReport(goalDTO).challengeReport(challengeDTO)
                .currentEcoScore(1250).currentRank("Level 5")
                .xpTransactions(List.of(
                        XpTransactionDTO.builder().id(1L).timestamp("2026-08-07 10:00").description("Vegan Week Completion").amount(500).source("CHALLENGE_COMPLETED").build()
                )).build();

        // 2. Generation
        write("EcoTrack_Personal_Sustainability_Report.pdf", pdfExportService.exportSustainabilityReport(overallDTO, com.ecotrack.report.design.ReportTheme.EMERALD));
        write("EcoTrack_Carbon_Report.pdf", pdfExportService.exportCarbonReport(carbonDTO, com.ecotrack.report.design.ReportTheme.EMERALD));
        write("EcoTrack_Goals_Report.pdf", pdfExportService.exportGoalReport(goalDTO, com.ecotrack.report.design.ReportTheme.EMERALD));
        write("EcoTrack_Challenges_Report.pdf", pdfExportService.exportChallengeReport(challengeDTO, com.ecotrack.report.design.ReportTheme.EMERALD));

        write("EcoTrack_Overall_Report.xlsx", excelExportService.exportSustainabilityReport(overallDTO, com.ecotrack.report.design.ReportTheme.EMERALD));
        write("EcoTrack_Carbon_Report.xlsx", excelExportService.exportCarbonReport(carbonDTO, com.ecotrack.report.design.ReportTheme.EMERALD));

        write("EcoTrack_Overall_Report.csv", csvExportService.exportSustainabilityReport(overallDTO));
        write("EcoTrack_Carbon_Report.csv", csvExportService.exportCarbonReport(carbonDTO));
    }

    private void write(String name, byte[] data) throws Exception {
        try (FileOutputStream fos = new FileOutputStream(new File("target/reports", name))) {
            fos.write(data);
        }
        System.out.println("Generated: " + name + " (" + data.length + " bytes)");
    }
}
