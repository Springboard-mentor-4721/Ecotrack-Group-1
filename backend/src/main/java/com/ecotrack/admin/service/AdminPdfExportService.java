package com.ecotrack.admin.service;

import com.ecotrack.admin.dto.analytics.*;
import com.ecotrack.report.design.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPdfExportService {

    private final ReportChartService chartService;

    public byte[] exportPdf(AdminAnalyticsFilter filter, AdminOverviewAnalyticsDTO overview, AdminUserAnalyticsDTO users, AdminGamificationAnalyticsDTO gamification, AdminBadgeAnalyticsDTO badges, AdminChallengeAnalyticsDTO challenges, AdminSustainabilityAnalyticsDTO sustainability, ReportTheme theme) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 54, 54);
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. Cover / Executive Header
            ReportMetadata metadata = ReportMetadata.builder()
                    .title("Platform Sustainability &\nEngagement Report")
                    .subtitle("Administrator Report")
                    .audience("Administrator")
                    .periodStart(filter.getStartDate() != null ? ReportFormatUtils.formatDate(filter.getStartDate().toLocalDate()) : "All Time")
                    .periodEnd(filter.getEndDate() != null ? ReportFormatUtils.formatDate(filter.getEndDate().toLocalDate()) : "Now")
                    .build();
            ReportPdfComponents.addReportHeader(document, metadata, theme);

            // 2. Executive Summary
            ReportPdfComponents.addSectionHeader(document, "EXECUTIVE SUMMARY", theme);
            
            PdfPTable kpiTable = new PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingBefore(10f);
            kpiTable.setSpacingAfter(20f);
            
            kpiTable.addCell(createKpiCell("Total Users", ReportFormatUtils.formatCount(overview.getTotalUsers()), theme));
            kpiTable.addCell(createKpiCell("Active Users", ReportFormatUtils.formatCount(overview.getActiveUsers()), theme));
            kpiTable.addCell(createKpiCell("Total Challenges", ReportFormatUtils.formatCount(overview.getTotalChallenges()), theme));
            kpiTable.addCell(createKpiCell("Total Emissions", ReportFormatUtils.formatCarbon(new BigDecimal(String.valueOf(overview.getTotalCarbonImpact()))), theme));
            document.add(kpiTable);

            // 3. User Analytics
            ReportPdfComponents.addSectionHeader(document, "01 USER ANALYTICS", theme);
            PdfPTable userKpiTable = new PdfPTable(3);
            userKpiTable.setWidthPercentage(100);
            userKpiTable.addCell(createKpiCell("Total Users", ReportFormatUtils.formatCount(users.getTotalUsers()), theme));
            userKpiTable.addCell(createKpiCell("New Users", ReportFormatUtils.formatCount(users.getNewUsersInPeriod()), theme));
            userKpiTable.addCell(createKpiCell("Active Users", ReportFormatUtils.formatCount(overview.getActiveUsers()), theme));
            document.add(userKpiTable);

            addTwoColumnCharts(document, 
                "Registration Trend", "Date", "Users", users.getRegistrationTrend(),
                "Status Distribution", users.getStatusDistribution(), theme
            );

            document.newPage();

            // 4. Gamification
            ReportPdfComponents.addSectionHeader(document, "02 GAMIFICATION", theme);
            PdfPTable gamKpiTable = new PdfPTable(3);
            gamKpiTable.setWidthPercentage(100);
            gamKpiTable.addCell(createKpiCell("Total XP", ReportFormatUtils.formatCount(gamification.getTotalPlatformXp()), theme));
            gamKpiTable.addCell(createKpiCell("Period XP", ReportFormatUtils.formatCount(gamification.getXpAwardedInPeriod()), theme));
            gamKpiTable.addCell(createKpiCell("Avg Eco Score", String.format("%.1f", gamification.getAverageEcoScore()), theme));
            document.add(gamKpiTable);

            addTwoColumnCharts(document, 
                "XP Earned Trend", "Date", "XP", gamification.getXpEarnedTrend(),
                "XP Source Distribution", gamification.getXpSourceDistribution(), theme
            );

            // 5. Badges
            ReportPdfComponents.addSectionHeader(document, "03 BADGES & ACHIEVEMENTS", theme);
            PdfPTable badgeKpiTable = new PdfPTable(2);
            badgeKpiTable.setWidthPercentage(100);
            badgeKpiTable.addCell(createKpiCell("Total Badges", ReportFormatUtils.formatCount(badges.getTotalBadgesAwarded()), theme));
            badgeKpiTable.addCell(createKpiCell("Period Badges", ReportFormatUtils.formatCount(badges.getBadgesAwardedInPeriod()), theme));
            document.add(badgeKpiTable);

            addTwoColumnCharts(document, 
                null, null, null, null,
                "Badge Type Distribution", badges.getBadgeTypeDistribution(), theme
            );

            document.newPage();

            // 6. Challenges
            ReportPdfComponents.addSectionHeader(document, "04 CHALLENGE PERFORMANCE", theme);
            PdfPTable chalKpiTable = new PdfPTable(4);
            chalKpiTable.setWidthPercentage(100);
            chalKpiTable.addCell(createKpiCell("Total", ReportFormatUtils.formatCount(challenges.getTotalChallenges()), theme));
            chalKpiTable.addCell(createKpiCell("Active", ReportFormatUtils.formatCount(challenges.getActiveChallenges()), theme));
            chalKpiTable.addCell(createKpiCell("Completed", ReportFormatUtils.formatCount(challenges.getCompletedChallenges()), theme));
            chalKpiTable.addCell(createKpiCell("Participants", ReportFormatUtils.formatCount(challenges.getTotalParticipants()), theme));
            document.add(chalKpiTable);

            addTwoColumnCharts(document, 
                null, null, null, null,
                "Challenge Status", challenges.getStatusDistribution(), theme
            );

            // 7. Sustainability
            ReportPdfComponents.addSectionHeader(document, "05 SUSTAINABILITY IMPACT", theme);
            PdfPTable susKpiTable = new PdfPTable(2);
            susKpiTable.setWidthPercentage(100);
            susKpiTable.addCell(createKpiCell("Total Tracked Emissions", ReportFormatUtils.formatCarbon(new BigDecimal(String.valueOf(sustainability.getTotalCarbonImpact()))), theme));
            susKpiTable.addCell(createKpiCell("Period Tracked Emissions", ReportFormatUtils.formatCarbon(new BigDecimal(String.valueOf(sustainability.getCarbonImpactInPeriod()))), theme));
            document.add(susKpiTable);

            addTwoColumnCharts(document, 
                "Emissions Trend", "Date", "kg CO₂e", sustainability.getCarbonTrend(),
                "Emissions by Category", sustainability.getImpactByCategory(), theme
            );

            ReportPdfComponents.addReportFooter(document, null, theme);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private PdfPCell createKpiCell(String label, String value, ReportTheme theme) {
        PdfPTable t = ReportPdfComponents.createKpiCard(label, value, theme);
        PdfPCell cell = new PdfPCell(t);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5f);
        return cell;
    }

    private void addTwoColumnCharts(Document document, String barTitle, String xLabel, String yLabel, List<AnalyticsTrendPointDTO> trend, String pieTitle, List<AnalyticsDistributionDTO> dist, ReportTheme theme) throws Exception {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        table.setSpacingAfter(10f);

        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.setPadding(5f);
        if (trend != null && !trend.isEmpty()) {
            List<String> cats = trend.stream().map(AnalyticsTrendPointDTO::getLabel).collect(Collectors.toList());
            List<Number> vals = trend.stream().map(AnalyticsTrendPointDTO::getValue).collect(Collectors.toList());
            byte[] bytes = chartService.generateBarChart(barTitle, xLabel, yLabel, cats, vals, theme);
            if (bytes != null && bytes.length > 0) {
                Image img = Image.getInstance(bytes);
                img.scaleToFit(250, 200);
                leftCell.addElement(img);
            } else {
                leftCell.addElement(new Paragraph("No trend data available.", ReportDesignConstants.getFontBody(theme)));
            }
        } else if (barTitle != null) {
            leftCell.addElement(new Paragraph("No " + barTitle.toLowerCase() + " activity available.", ReportDesignConstants.getFontBody(theme)));
        }
        table.addCell(leftCell);

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setPadding(5f);
        if (dist != null && !dist.isEmpty()) {
            Map<String, BigDecimal> pieData = new LinkedHashMap<>();
            for (AnalyticsDistributionDTO d : dist) {
                pieData.put(d.getCategory(), new BigDecimal(String.valueOf(d.getValue())));
            }
            byte[] bytes = chartService.generatePieChart(pieTitle, pieData, theme);
            if (bytes != null && bytes.length > 0) {
                Image img = Image.getInstance(bytes);
                img.scaleToFit(250, 200);
                rightCell.addElement(img);
            } else {
                rightCell.addElement(new Paragraph("No distribution data available.", ReportDesignConstants.getFontBody(theme)));
            }
        } else if (pieTitle != null) {
            rightCell.addElement(new Paragraph("No " + pieTitle.toLowerCase() + " data available.", ReportDesignConstants.getFontBody(theme)));
        }
        table.addCell(rightCell);

        document.add(table);
    }
}
