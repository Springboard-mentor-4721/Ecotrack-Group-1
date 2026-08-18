package com.ecotrack.admin.service;

import com.ecotrack.admin.dto.analytics.*;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class AdminExcelExportService {

    public byte[] exportExcel(AdminAnalyticsFilter filter, AdminOverviewAnalyticsDTO overview, AdminUserAnalyticsDTO users, AdminGamificationAnalyticsDTO gamification, AdminBadgeAnalyticsDTO badges, AdminChallengeAnalyticsDTO challenges, AdminSustainabilityAnalyticsDTO sustainability, com.ecotrack.report.design.ReportTheme theme) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            org.apache.poi.ss.usermodel.CellStyle headerStyle = createHeaderStyle(workbook, theme);
            
            // Sheet 1: Overview
            Sheet s1 = workbook.createSheet("Overview");
            createStyledRow(s1, 0, headerStyle, "Metric", "Value");
            createRow(s1, 1, null, "Total Users", String.valueOf(overview.getTotalUsers()));
            createRow(s1, 2, null, "Active Users", String.valueOf(overview.getActiveUsers()));
            createRow(s1, 3, null, "Total XP Distributed", String.valueOf(overview.getTotalXp()));
            createRow(s1, 4, null, "Badges Awarded", String.valueOf(overview.getTotalBadgesAwarded()));
            createRow(s1, 5, null, "Total Challenges", String.valueOf(overview.getTotalChallenges()));
            createRow(s1, 6, null, "Total Carbon Tracked (kg)", String.valueOf(overview.getTotalCarbonImpact()));
            createRow(s1, 7, null, "Active Challenges", String.valueOf(overview.getActiveChallenges()));
            createRow(s1, 8, null, "Completed Challenges", String.valueOf(overview.getCompletedChallenges()));
            createRow(s1, 9, null, "Challenge XP Distributed", String.valueOf(overview.getTotalChallengeXp()));

            // Sheet 2: Users
            Sheet s2 = workbook.createSheet("Users");
            createStyledRow(s2, 0, headerStyle, "Metric", "Value");
            createRow(s2, 1, null, "Total Users", String.valueOf(users.getTotalUsers()));
            createRow(s2, 2, null, "New Users in Period", String.valueOf(users.getNewUsersInPeriod()));
            
            int rowIdx = 4;
            createStyledRow(s2, rowIdx++, headerStyle, "Status Distribution", "");
            for (AnalyticsDistributionDTO d : users.getStatusDistribution()) createRow(s2, rowIdx++, null, d.getCategory(), String.valueOf(d.getValue()));
            
            rowIdx++;
            createStyledRow(s2, rowIdx++, headerStyle, "Role Distribution", "");
            for (AnalyticsDistributionDTO d : users.getRoleDistribution()) createRow(s2, rowIdx++, null, d.getCategory(), String.valueOf(d.getValue()));

            rowIdx++;
            createStyledRow(s2, rowIdx++, headerStyle, "Registration Trend", "");
            for (AnalyticsTrendPointDTO t : users.getRegistrationTrend()) createRow(s2, rowIdx++, null, t.getLabel(), String.valueOf(t.getValue()));

            // Sheet 3: Gamification
            Sheet s3 = workbook.createSheet("Gamification");
            createStyledRow(s3, 0, headerStyle, "Metric", "Value");
            createRow(s3, 1, null, "Total XP", String.valueOf(gamification.getTotalPlatformXp()));
            createRow(s3, 2, null, "Period XP", String.valueOf(gamification.getXpAwardedInPeriod()));
            createRow(s3, 3, null, "Average Eco Score", String.valueOf(gamification.getAverageEcoScore()));
            
            rowIdx = 5;
            createStyledRow(s3, rowIdx++, headerStyle, "XP Source Distribution", "");
            for (AnalyticsDistributionDTO d : gamification.getXpSourceDistribution()) createRow(s3, rowIdx++, null, d.getCategory(), String.valueOf(d.getValue()));
            
            rowIdx++;
            createStyledRow(s3, rowIdx++, headerStyle, "Level Distribution", "");
            for (AnalyticsDistributionDTO d : gamification.getLevelDistribution()) createRow(s3, rowIdx++, null, d.getCategory(), String.valueOf(d.getValue()));

            rowIdx++;
            if (gamification.getXpEarnedTrend() != null) {
                createStyledRow(s3, rowIdx++, headerStyle, "XP Trend", "");
                for (AnalyticsTrendPointDTO t : gamification.getXpEarnedTrend()) createRow(s3, rowIdx++, null, t.getLabel(), String.valueOf(t.getValue()));
            }

            // Sheet 4: Badges
            Sheet s4 = workbook.createSheet("Badges");
            createStyledRow(s4, 0, headerStyle, "Metric", "Value");
            createRow(s4, 1, null, "Total Badges Awarded", String.valueOf(badges.getTotalBadgesAwarded()));
            createRow(s4, 2, null, "Period Badges Awarded", String.valueOf(badges.getBadgesAwardedInPeriod()));
            
            rowIdx = 4;
            createStyledRow(s4, rowIdx++, headerStyle, "Most Awarded Badges", "");
            for (AnalyticsDistributionDTO d : badges.getMostAwardedBadges()) createRow(s4, rowIdx++, null, d.getCategory(), String.valueOf(d.getValue()));

            rowIdx++;
            createStyledRow(s4, rowIdx++, headerStyle, "Badge Type Distribution", "");
            for (AnalyticsDistributionDTO d : badges.getBadgeTypeDistribution()) createRow(s4, rowIdx++, null, d.getCategory(), String.valueOf(d.getValue()));

            // Sheet 5: Challenges
            Sheet s5 = workbook.createSheet("Challenges");
            createStyledRow(s5, 0, headerStyle, "Metric", "Value");
            createRow(s5, 1, null, "Total Challenges in Period", String.valueOf(challenges.getTotalChallenges()));
            createRow(s5, 2, null, "Active Challenges", String.valueOf(challenges.getActiveChallenges()));
            createRow(s5, 3, null, "Completed Challenges", String.valueOf(challenges.getCompletedChallenges()));
            createRow(s5, 4, null, "Pending Challenges", String.valueOf(challenges.getPendingChallenges()));
            createRow(s5, 5, null, "Upcoming Challenges", String.valueOf(challenges.getUpcomingChallenges()));
            createRow(s5, 6, null, "Total Participants", String.valueOf(challenges.getTotalParticipants()));
            createRow(s5, 7, null, "Challenge XP", String.valueOf(challenges.getXpDistributedInPeriod()));
            
            rowIdx = 9;
            createStyledRow(s5, rowIdx++, headerStyle, "Status Distribution", "");
            for (AnalyticsDistributionDTO d : challenges.getStatusDistribution()) createRow(s5, rowIdx++, null, d.getCategory(), String.valueOf(d.getValue()));

            rowIdx++;
            createStyledRow(s5, rowIdx++, headerStyle, "Progress Metric Distribution", "");
            for (AnalyticsDistributionDTO d : challenges.getMetricDistribution()) createRow(s5, rowIdx++, null, d.getCategory(), String.valueOf(d.getValue()));

            // Sheet 6: Sustainability
            Sheet s6 = workbook.createSheet("Sustainability");
            createStyledRow(s6, 0, headerStyle, "Metric", "Value");
            createRow(s6, 1, null, "Total Tracked Emissions", String.valueOf(sustainability.getTotalCarbonImpact()));
            createRow(s6, 2, null, "Period Tracked Emissions", String.valueOf(sustainability.getCarbonImpactInPeriod()));
            
            rowIdx = 4;
            createStyledRow(s6, rowIdx++, headerStyle, "Category Impact", "");
            for (AnalyticsDistributionDTO d : sustainability.getImpactByCategory()) createRow(s6, rowIdx++, null, d.getCategory(), String.valueOf(d.getValue()));

            rowIdx++;
            createStyledRow(s6, rowIdx++, headerStyle, "Emission Trend", "");
            for (AnalyticsTrendPointDTO t : sustainability.getCarbonTrend()) createRow(s6, rowIdx++, null, t.getLabel(), String.valueOf(t.getValue()));

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    private void createStyledRow(Sheet sheet, int rowIndex, org.apache.poi.ss.usermodel.CellStyle style, String... values) {
        Row row = sheet.createRow(rowIndex);
        for (int i = 0; i < values.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = row.createCell(i);
            cell.setCellValue(values[i] != null ? values[i] : "");
            if (style != null) {
                cell.setCellStyle(style);
            }
        }
    }
    
    private void createRow(Sheet sheet, int rowIndex, String... values) {
        createStyledRow(sheet, rowIndex, null, values);
    }
    
    private org.apache.poi.ss.usermodel.CellStyle createHeaderStyle(Workbook workbook, com.ecotrack.report.design.ReportTheme theme) {
        org.apache.poi.ss.usermodel.CellStyle style = workbook.createCellStyle();
        if (workbook instanceof XSSFWorkbook && theme != null) {
            org.apache.poi.xssf.usermodel.XSSFCellStyle xssfStyle = (org.apache.poi.xssf.usermodel.XSSFCellStyle) style;
            java.awt.Color bg = theme.getTableHeaderColor();
            xssfStyle.setFillForegroundColor(new org.apache.poi.xssf.usermodel.XSSFColor(bg, null));
            xssfStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            
            org.apache.poi.ss.usermodel.Font font = workbook.createFont();
            font.setBold(true);
            java.awt.Color fg = theme.getTextColor();
            if (bg.equals(theme.getPrimaryColor())) { // Emerald table headers use primary color which is dark
                font.setColor(org.apache.poi.ss.usermodel.IndexedColors.WHITE.getIndex());
            } else if (workbook instanceof XSSFWorkbook) {
                ((org.apache.poi.xssf.usermodel.XSSFFont)font).setColor(new org.apache.poi.xssf.usermodel.XSSFColor(fg, null));
            }
            style.setFont(font);
        }
        return style;
    }
}
