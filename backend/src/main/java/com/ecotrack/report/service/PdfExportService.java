package com.ecotrack.report.service;

import com.ecotrack.report.design.ReportChartService;
import com.ecotrack.report.design.ReportDesignConstants;
import com.ecotrack.report.design.ReportFormatUtils;
import com.ecotrack.report.design.ReportMetadata;
import com.ecotrack.report.design.ReportPdfComponents;
import com.ecotrack.report.design.ReportTheme;
import com.ecotrack.report.dto.CarbonReportDTO;
import com.ecotrack.report.dto.ChallengeReportDTO;
import com.ecotrack.report.dto.GoalReportDTO;
import com.ecotrack.report.dto.SustainabilityReportDTO;
import com.lowagie.text.Document;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PdfExportService {

    private final ReportChartService chartService;

    public byte[] exportCarbonReport(CarbonReportDTO report, ReportTheme theme) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 54, 54);
            PdfWriter.getInstance(document, out);
            document.open();

            ReportMetadata metadata = ReportMetadata.builder()
                    .title("Personal Sustainability Report")
                    .subtitle("Carbon Footprint Analysis")
                    .audience("User")
                    .userName(report.getUserName())
                    .userEmail(report.getUserEmail())
                    .periodStart(report.getStartDate() != null ? ReportFormatUtils.formatDate(LocalDate.parse(report.getStartDate())) : "All Time")
                    .periodEnd(report.getEndDate() != null ? ReportFormatUtils.formatDate(LocalDate.parse(report.getEndDate())) : "Now")
                    .build();
            ReportPdfComponents.addReportHeader(document, metadata, theme);

            ReportPdfComponents.addSectionHeader(document, "EXECUTIVE SUMMARY", theme);
            PdfPTable kpiTable = new PdfPTable(1);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(20f);
            kpiTable.addCell(createKpiCell("Total Tracked Emissions", ReportFormatUtils.formatCarbon(report.getTotalEmissions()), theme));
            document.add(kpiTable);

            if (report.getEmissionsByCategory() != null && !report.getEmissionsByCategory().isEmpty()) {
                ReportPdfComponents.addSectionHeader(document, "01 CATEGORY BREAKDOWN", theme);
                PdfPTable layout = new PdfPTable(1);
                layout.setWidthPercentage(100);
                
                PdfPCell chartCell = new PdfPCell();
                chartCell.setBorder(Rectangle.NO_BORDER);
                byte[] pieBytes = chartService.generateEmissionsByCategoryChart(report.getEmissionsByCategory(), theme);
                if (pieBytes != null && pieBytes.length > 0) {
                    Image img = Image.getInstance(pieBytes);
                    img.scaleToFit(400, 300);
                    img.setAlignment(Image.ALIGN_CENTER);
                    chartCell.addElement(img);
                } else {
                    chartCell.addElement(new Paragraph("No category data available.", ReportDesignConstants.getFontBody(theme)));
                }
                layout.addCell(chartCell);
                document.add(layout);
            }

            ReportPdfComponents.addSectionHeader(document, "02 ACTIVITY DETAIL", theme);
            if (report.getEntries() != null && !report.getEntries().isEmpty()) {
                PdfPTable table = ReportPdfComponents.createStyledTable(4, new String[]{"Date", "Category", "Subcategory", "Emissions"}, theme);
                // Set relative column widths so Date and Emissions are narrower than Category
                table.setWidths(new float[]{2f, 3f, 3f, 2f});
                for (CarbonReportDTO.CarbonEntryDetail detail : report.getEntries()) {
                    table.addCell(createTableCell(ReportFormatUtils.formatStringDate(detail.getDate()), theme));
                    table.addCell(createTableCell(ReportFormatUtils.toHumanReadable(detail.getCategory()), theme));
                    table.addCell(createTableCell(ReportFormatUtils.toHumanReadable(detail.getSubCategory()), theme));
                    table.addCell(createTableCell(ReportFormatUtils.formatCarbon(detail.getEmission()), com.lowagie.text.Element.ALIGN_RIGHT, theme));
                }
                document.add(table);
            } else {
                document.add(new Paragraph("No tracked activities were recorded during this period.", ReportDesignConstants.getFontBody(theme)));
            }

            ReportPdfComponents.addReportFooter(document, null, theme);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Carbon PDF", e);
        }
    }

    public byte[] exportGoalReport(GoalReportDTO report, ReportTheme theme) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 54, 54);
            PdfWriter.getInstance(document, out);
            document.open();

            ReportMetadata metadata = ReportMetadata.builder()
                    .title("Personal Sustainability Report")
                    .subtitle("Goal Achievement")
                    .audience("User")
                    .userName(report.getUserName())
                    .userEmail(report.getUserEmail())
                    .periodStart(report.getStartDate() != null ? ReportFormatUtils.formatDate(LocalDate.parse(report.getStartDate())) : "All Time")
                    .periodEnd(report.getEndDate() != null ? ReportFormatUtils.formatDate(LocalDate.parse(report.getEndDate())) : "Now")
                    .build();
            ReportPdfComponents.addReportHeader(document, metadata, theme);

            ReportPdfComponents.addSectionHeader(document, "EXECUTIVE SUMMARY", theme);
            PdfPTable kpiTable = new PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(20f);
            kpiTable.addCell(createKpiCell("Total Goals", ReportFormatUtils.formatCount(report.getTotalGoals()), theme));
            kpiTable.addCell(createKpiCell("Active Goals", ReportFormatUtils.formatCount(report.getActiveGoals()), theme));
            kpiTable.addCell(createKpiCell("Completed Goals", ReportFormatUtils.formatCount(report.getCompletedGoals()), theme));
            kpiTable.addCell(createKpiCell("Failed Goals", ReportFormatUtils.formatCount(report.getFailedGoals()), theme));
            document.add(kpiTable);

            ReportPdfComponents.addSectionHeader(document, "01 GOALS STATUS", theme);
            Map<String, BigDecimal> goalStatusMap = new LinkedHashMap<>();
            goalStatusMap.put("Active", BigDecimal.valueOf(report.getActiveGoals()));
            goalStatusMap.put("Completed", BigDecimal.valueOf(report.getCompletedGoals()));
            goalStatusMap.put("Failed", BigDecimal.valueOf(report.getFailedGoals()));
            
            PdfPTable layout = new PdfPTable(1);
            layout.setWidthPercentage(100);
            PdfPCell chartCell = new PdfPCell();
            chartCell.setBorder(Rectangle.NO_BORDER);
            byte[] pieBytes = null;
            try {
                pieBytes = chartService.generateGoalsStatusChart(Map.of(
                        "Active", report.getActiveGoals(),
                        "Completed", report.getCompletedGoals(),
                        "Failed", report.getFailedGoals()
                ), theme);
            } catch (Exception e) {
                // ignore
            }
            if (pieBytes != null && pieBytes.length > 0 && report.getTotalGoals() > 0) {
                Image img = Image.getInstance(pieBytes);
                img.scaleToFit(400, 300);
                img.setAlignment(Image.ALIGN_CENTER);
                chartCell.addElement(img);
            } else {
                chartCell.addElement(new Paragraph("No goal status distribution available.", ReportDesignConstants.getFontBody(theme)));
            }
            layout.addCell(chartCell);
            document.add(layout);

            ReportPdfComponents.addSectionHeader(document, "02 GOAL DETAILS", theme);
            if (report.getGoals() != null && !report.getGoals().isEmpty()) {
                PdfPTable table = ReportPdfComponents.createStyledTable(5, new String[]{"Title", "Type", "Status", "Progress", "Target Date"}, theme);
                table.setWidths(new float[]{3f, 2.5f, 2f, 1.5f, 2f});
                for (GoalReportDTO.GoalDetail detail : report.getGoals()) {
                    table.addCell(createTableCell(detail.getTitle(), theme));
                    table.addCell(createTableCell(ReportFormatUtils.toHumanReadable(detail.getType()), theme));
                    table.addCell(createTableCell(ReportFormatUtils.toHumanReadable(detail.getStatus()), theme));
                    table.addCell(createTableCell(ReportFormatUtils.formatPercentage(detail.getProgressPercentage().doubleValue()), com.lowagie.text.Element.ALIGN_RIGHT, theme));
                    table.addCell(createTableCell(ReportFormatUtils.formatStringDate(detail.getTargetDate()), theme));
                }
                document.add(table);
            } else {
                document.add(new Paragraph("No goal participation was recorded during this period.", ReportDesignConstants.getFontBody(theme)));
            }

            ReportPdfComponents.addReportFooter(document, null, theme);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Goal PDF", e);
        }
    }

    public byte[] exportChallengeReport(ChallengeReportDTO report, ReportTheme theme) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 54, 54);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            ReportMetadata metadata = ReportMetadata.builder()
                    .title("Personal Sustainability Report")
                    .subtitle("Challenge Participation")
                    .audience("User")
                    .userName(report.getUserName())
                    .userEmail(report.getUserEmail())
                    .periodStart(report.getStartDate() != null ? ReportFormatUtils.formatDate(LocalDate.parse(report.getStartDate())) : "All Time")
                    .periodEnd(report.getEndDate() != null ? ReportFormatUtils.formatDate(LocalDate.parse(report.getEndDate())) : "Now")
                    .build();
            ReportPdfComponents.addReportHeader(document, metadata, theme);

            ReportPdfComponents.addSectionHeader(document, "EXECUTIVE SUMMARY", theme);
            PdfPTable kpiTable = new PdfPTable(3);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(20f);
            kpiTable.addCell(createKpiCell("Total Participated", ReportFormatUtils.formatCount(report.getTotalParticipated()), theme));
            kpiTable.addCell(createKpiCell("Completed Challenges", ReportFormatUtils.formatCount(report.getCompletedChallenges()), theme));
            kpiTable.addCell(createKpiCell("Total XP Earned", ReportFormatUtils.formatCount(report.getTotalXpEarned()), theme));
            document.add(kpiTable);

            ReportPdfComponents.addSectionHeader(document, "01 CHALLENGE HIGHLIGHTS", theme);
            if (report.getChallenges() != null && !report.getChallenges().isEmpty()) {
                PdfPTable table = ReportPdfComponents.createStyledTable(6, new String[]{"Title", "Category", "Status", "XP Earned", "Joined Date", "Completed"}, theme);
                table.setWidths(new float[]{3f, 2f, 2f, 1.5f, 2f, 2f});
                for (ChallengeReportDTO.ChallengeDetail detail : report.getChallenges()) {
                    table.addCell(createTableCell(detail.getTitle(), theme));
                    table.addCell(createTableCell(ReportFormatUtils.toHumanReadable(detail.getCategory()), theme));
                    table.addCell(createTableCell(ReportFormatUtils.toHumanReadable(detail.getStatus()), theme));
                    table.addCell(createTableCell(ReportFormatUtils.formatCount(detail.getXpEarned()) + " XP", com.lowagie.text.Element.ALIGN_RIGHT, theme));
                    table.addCell(createTableCell(ReportFormatUtils.formatStringDate(detail.getJoinedDate()), theme));
                    table.addCell(createTableCell(ReportFormatUtils.formatStringDate(detail.getCompletedDate()), theme));
                }
                document.add(table);
            } else {
                document.add(new Paragraph("No challenge participation was recorded during this period.", ReportDesignConstants.getFontBody(theme)));
            }

            ReportPdfComponents.addReportFooter(document, writer, theme);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Challenge PDF", e);
        }
    }

    public byte[] exportSustainabilityReport(SustainabilityReportDTO report, ReportTheme theme) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 54, 54);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            ReportMetadata metadata = ReportMetadata.builder()
                    .title("Personal Sustainability Report")
                    .subtitle("Your Sustainability Journey")
                    .audience("User")
                    .userName(report.getUserName())
                    .userEmail(report.getUserEmail())
                    .periodStart(report.getStartDate() != null ? ReportFormatUtils.formatDate(LocalDate.parse(report.getStartDate())) : "All Time")
                    .periodEnd(report.getEndDate() != null ? ReportFormatUtils.formatDate(LocalDate.parse(report.getEndDate())) : "Now")
                    .build();
            ReportPdfComponents.addReportHeader(document, metadata, theme);

            ReportPdfComponents.addSectionHeader(document, "EXECUTIVE SUMMARY", theme);
            
            PdfPTable kpiTable = new PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(20f);
            String emissionsStr = report.getCarbonReport() != null && report.getCarbonReport().getTotalEmissions() != null 
                    ? ReportFormatUtils.formatCarbon(report.getCarbonReport().getTotalEmissions()) : "0 kg CO₂e";
            kpiTable.addCell(createKpiCell("Eco Score", String.valueOf(report.getCurrentEcoScore()), theme));
            java.math.BigDecimal carbonTracked = report.getCarbonReport() != null && report.getCarbonReport().getTotalEmissions() != null ? report.getCarbonReport().getTotalEmissions() : java.math.BigDecimal.ZERO;
            kpiTable.addCell(createKpiCell("Total CO2 Tracked", ReportFormatUtils.formatCarbon(carbonTracked), theme));
            int goalsAchieved = report.getGoalReport() != null ? report.getGoalReport().getCompletedGoals() : 0;
            kpiTable.addCell(createKpiCell("Goals Achieved", String.valueOf(goalsAchieved), theme));
            kpiTable.addCell(createKpiCell("Challenges Completed", report.getChallengeReport() != null ? ReportFormatUtils.formatCount(report.getChallengeReport().getCompletedChallenges()) : "0", theme));
            document.add(kpiTable);

            document.add(new Paragraph("During this reporting period, you tracked " + emissionsStr + " across your activities and achieved a rank of " + (report.getCurrentRank() != null ? report.getCurrentRank() : "N/A") + ".", ReportDesignConstants.getFontBody(theme)));
            document.add(new Paragraph(" ", ReportDesignConstants.getFontBody(theme)));

            if (report.getCarbonReport() != null && report.getCarbonReport().getEmissionsByCategory() != null && !report.getCarbonReport().getEmissionsByCategory().isEmpty()) {
                try {
                    byte[] chartBytes = chartService.generateEcoScoreTrendChart(null, theme);
                    Image chartImage = Image.getInstance(chartBytes);
                    chartImage.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                    chartImage.scaleToFit(400, 250);
                    document.add(chartImage);
                } catch (Exception e) {
                    System.err.println("Failed to render carbon chart: " + e.getMessage());
                }
            }

            document.newPage();

            ReportPdfComponents.addSectionHeader(document, "01 CARBON FOOTPRINT ACTIVITY", theme);
            if (report.getCarbonReport() != null && report.getCarbonReport().getEntries() != null && !report.getCarbonReport().getEntries().isEmpty()) {
                PdfPTable carbonTable = ReportPdfComponents.createStyledTable(4, new String[]{"Date", "Category", "Sub-Category", "Emissions"}, theme);
                carbonTable.setWidths(new float[]{2f, 3f, 3f, 2f});
                for (CarbonReportDTO.CarbonEntryDetail detail : report.getCarbonReport().getEntries()) {
                    carbonTable.addCell(createTableCell(ReportFormatUtils.formatStringDate(detail.getDate()), theme));
                    carbonTable.addCell(createTableCell(ReportFormatUtils.toHumanReadable(detail.getCategory()), theme));
                    carbonTable.addCell(createTableCell(ReportFormatUtils.toHumanReadable(detail.getSubCategory()), theme));
                    carbonTable.addCell(createTableCell(ReportFormatUtils.formatCarbon(detail.getEmission()), com.lowagie.text.Element.ALIGN_RIGHT, theme));
                }
                document.add(carbonTable);
            } else {
                document.add(new Paragraph("No carbon activity recorded during this period.", ReportDesignConstants.getFontBody(theme)));
            }

            document.newPage();

            ReportPdfComponents.addSectionHeader(document, "02 GOAL ACHIEVEMENT", theme);
            if (report.getGoalReport() != null && report.getGoalReport().getGoals() != null && !report.getGoalReport().getGoals().isEmpty()) {
                PdfPTable goalsKpi = new PdfPTable(4);
                goalsKpi.setWidthPercentage(100);
                goalsKpi.setSpacingAfter(20f);
                goalsKpi.addCell(createKpiCell("Total Goals", ReportFormatUtils.formatCount(report.getGoalReport().getTotalGoals()), theme));
                goalsKpi.addCell(createKpiCell("Active Goals", ReportFormatUtils.formatCount(report.getGoalReport().getActiveGoals()), theme));
                goalsKpi.addCell(createKpiCell("Completed", ReportFormatUtils.formatCount(report.getGoalReport().getCompletedGoals()), theme));
                goalsKpi.addCell(createKpiCell("Failed", ReportFormatUtils.formatCount(report.getGoalReport().getFailedGoals()), theme));
                document.add(goalsKpi);
                
                PdfPTable goalsTable = ReportPdfComponents.createStyledTable(5, new String[]{"Title", "Type", "Status", "Progress", "Target Date"}, theme);
                goalsTable.setWidths(new float[]{3f, 2.5f, 2f, 1.5f, 2f});
                for (GoalReportDTO.GoalDetail detail : report.getGoalReport().getGoals()) {
                    goalsTable.addCell(createTableCell(detail.getTitle(), theme));
                    goalsTable.addCell(createTableCell(ReportFormatUtils.toHumanReadable(detail.getType()), theme));
                    goalsTable.addCell(createTableCell(ReportFormatUtils.toHumanReadable(detail.getStatus()), theme));
                    goalsTable.addCell(createTableCell(ReportFormatUtils.formatPercentage(detail.getProgressPercentage() != null ? detail.getProgressPercentage().doubleValue() : 0.0), com.lowagie.text.Element.ALIGN_RIGHT, theme));
                    goalsTable.addCell(createTableCell(ReportFormatUtils.formatStringDate(detail.getTargetDate()), theme));
                }
                document.add(goalsTable);
            } else {
                document.add(new Paragraph("No goals recorded during this period.", ReportDesignConstants.getFontBody(theme)));
            }

            document.newPage();

            ReportPdfComponents.addSectionHeader(document, "03 CHALLENGE PARTICIPATION", theme);
            if (report.getChallengeReport() != null && report.getChallengeReport().getChallenges() != null && !report.getChallengeReport().getChallenges().isEmpty()) {
                PdfPTable challKpi = new PdfPTable(3);
                challKpi.setWidthPercentage(100);
                challKpi.setSpacingAfter(20f);
                challKpi.addCell(createKpiCell("Participated", ReportFormatUtils.formatCount(report.getChallengeReport().getTotalParticipated()), theme));
                challKpi.addCell(createKpiCell("Completed", ReportFormatUtils.formatCount(report.getChallengeReport().getCompletedChallenges()), theme));
                challKpi.addCell(createKpiCell("XP Earned", ReportFormatUtils.formatCount(report.getChallengeReport().getTotalXpEarned()), theme));
                document.add(challKpi);
                
                PdfPTable challTable = ReportPdfComponents.createStyledTable(6, new String[]{"Title", "Category", "Status", "XP Earned", "Joined Date", "Completed"}, theme);
                challTable.setWidths(new float[]{3f, 2f, 2f, 1.5f, 2f, 2f});
                for (ChallengeReportDTO.ChallengeDetail detail : report.getChallengeReport().getChallenges()) {
                    challTable.addCell(createTableCell(detail.getTitle(), theme));
                    challTable.addCell(createTableCell(ReportFormatUtils.toHumanReadable(detail.getCategory()), theme));
                    challTable.addCell(createTableCell(ReportFormatUtils.toHumanReadable(detail.getStatus()), theme));
                    challTable.addCell(createTableCell(ReportFormatUtils.formatCount(detail.getXpEarned()) + " XP", com.lowagie.text.Element.ALIGN_RIGHT, theme));
                    challTable.addCell(createTableCell(ReportFormatUtils.formatStringDate(detail.getJoinedDate()), theme));
                    challTable.addCell(createTableCell(ReportFormatUtils.formatStringDate(detail.getCompletedDate()), theme));
                }
                document.add(challTable);
            } else {
                document.add(new Paragraph("No challenge participation recorded during this period.", ReportDesignConstants.getFontBody(theme)));
            }

            document.newPage();

            ReportPdfComponents.addSectionHeader(document, "04 GAMIFICATION & ECO IMPACT", theme);
            PdfPTable rankTable = new PdfPTable(2);
            rankTable.setWidthPercentage(100);
            rankTable.setSpacingAfter(20f);
            rankTable.addCell(createKpiCell("Current Rank", report.getCurrentRank() != null ? report.getCurrentRank() : "N/A", theme));
            rankTable.addCell(createKpiCell("Current Eco Score", ReportFormatUtils.formatCount(report.getCurrentEcoScore()), theme));
            document.add(rankTable);

            if (report.getXpTransactions() != null && !report.getXpTransactions().isEmpty()) {
                PdfPTable table = ReportPdfComponents.createStyledTable(3, new String[]{"Date", "Action", "XP Amount"}, theme);
                table.setWidths(new float[]{2f, 4f, 1.5f});
                for (com.ecotrack.report.dto.XpTransactionDTO tx : report.getXpTransactions()) {
                    table.addCell(createTableCell(ReportFormatUtils.formatStringDate(tx.getTimestamp()), theme));
                    table.addCell(createTableCell(tx.getDescription(), theme));
                    table.addCell(createTableCell((tx.getAmount() > 0 ? "+" : "") + tx.getAmount() + " XP", com.lowagie.text.Element.ALIGN_RIGHT, theme));
                }
                document.add(table);
            } else {
                document.add(new Paragraph("No XP activity was recorded during this period.", ReportDesignConstants.getFontBody(theme)));
            }

            document.newPage();
            
            // --- FINAL PAGE: SUSTAINABILITY SUMMARY ---
            ReportPdfComponents.addSectionHeader(document, "SUSTAINABILITY SUMMARY", theme);
            document.add(new Paragraph("This report reflects sustainability activity recorded in EcoTrack for the selected reporting period.", ReportDesignConstants.getFontBody(theme)));

            ReportPdfComponents.addReportFooter(document, writer, theme);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Sustainability PDF", e);
        }
    }

    private PdfPCell createKpiCell(String label, String value, ReportTheme theme) {
        PdfPCell cell = new PdfPCell(ReportPdfComponents.createKpiCard(label, value, theme));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5f);
        return cell;
    }

    private PdfPCell createTableCell(String content, ReportTheme theme) {
        return createTableCell(content, com.lowagie.text.Element.ALIGN_LEFT, theme);
    }

    private PdfPCell createTableCell(String content, int alignment, ReportTheme theme) {
        Paragraph p = new Paragraph(content != null ? content : "", ReportDesignConstants.getFontBody(theme));
        PdfPCell cell = new PdfPCell(p);
        cell.setPadding(8f);
        cell.setPaddingBottom(10f); // Match height feeling
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(com.lowagie.text.Element.ALIGN_MIDDLE);
        cell.setBorderColor(theme.getBorderColor());
        return cell;
    }
}
