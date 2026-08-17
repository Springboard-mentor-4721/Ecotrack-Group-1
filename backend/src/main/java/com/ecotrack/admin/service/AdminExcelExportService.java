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

    public byte[] exportExcel(AdminAnalyticsFilter filter, AdminOverviewAnalyticsDTO overview, AdminUserAnalyticsDTO users, AdminGamificationAnalyticsDTO gamification, AdminBadgeAnalyticsDTO badges, AdminChallengeAnalyticsDTO challenges, AdminSustainabilityAnalyticsDTO sustainability) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // Sheet 1: Overview
            Sheet s1 = workbook.createSheet("Overview");
            createRow(s1, 0, "Metric", "Value");
            createRow(s1, 1, "Total Users", String.valueOf(overview.getTotalUsers()));
            createRow(s1, 2, "Active Users", String.valueOf(overview.getActiveUsers()));
            createRow(s1, 3, "Total XP Distributed", String.valueOf(overview.getTotalXp()));
            createRow(s1, 4, "Badges Awarded", String.valueOf(overview.getTotalBadgesAwarded()));
            createRow(s1, 5, "Total Challenges", String.valueOf(overview.getTotalChallenges()));
            createRow(s1, 6, "Total Carbon Tracked (kg)", String.valueOf(overview.getTotalCarbonImpact()));
            createRow(s1, 7, "Active Challenges", String.valueOf(overview.getActiveChallenges()));
            createRow(s1, 8, "Completed Challenges", String.valueOf(overview.getCompletedChallenges()));
            createRow(s1, 9, "Challenge XP Distributed", String.valueOf(overview.getTotalChallengeXp()));

            // Sheet 2: Users
            Sheet s2 = workbook.createSheet("Users");
            createRow(s2, 0, "Metric", "Value");
            createRow(s2, 1, "Total Users", String.valueOf(users.getTotalUsers()));
            createRow(s2, 2, "New Users in Period", String.valueOf(users.getNewUsersInPeriod()));
            
            int rowIdx = 4;
            createRow(s2, rowIdx++, "Status Distribution", "");
            for (AnalyticsDistributionDTO d : users.getStatusDistribution()) createRow(s2, rowIdx++, d.getCategory(), String.valueOf(d.getValue()));
            
            rowIdx++;
            createRow(s2, rowIdx++, "Role Distribution", "");
            for (AnalyticsDistributionDTO d : users.getRoleDistribution()) createRow(s2, rowIdx++, d.getCategory(), String.valueOf(d.getValue()));

            rowIdx++;
            createRow(s2, rowIdx++, "Registration Trend", "");
            for (AnalyticsTrendPointDTO t : users.getRegistrationTrend()) createRow(s2, rowIdx++, t.getLabel(), String.valueOf(t.getValue()));

            // Sheet 3: Gamification
            Sheet s3 = workbook.createSheet("Gamification");
            createRow(s3, 0, "Metric", "Value");
            createRow(s3, 1, "Total XP", String.valueOf(gamification.getTotalPlatformXp()));
            createRow(s3, 2, "Period XP", String.valueOf(gamification.getXpAwardedInPeriod()));
            createRow(s3, 3, "Average Eco Score", String.valueOf(gamification.getAverageEcoScore()));
            
            rowIdx = 5;
            createRow(s3, rowIdx++, "XP Source Distribution", "");
            for (AnalyticsDistributionDTO d : gamification.getXpSourceDistribution()) createRow(s3, rowIdx++, d.getCategory(), String.valueOf(d.getValue()));
            
            rowIdx++;
            createRow(s3, rowIdx++, "Level Distribution", "");
            for (AnalyticsDistributionDTO d : gamification.getLevelDistribution()) createRow(s3, rowIdx++, d.getCategory(), String.valueOf(d.getValue()));

            rowIdx++;
            if (gamification.getXpEarnedTrend() != null) {
                createRow(s3, rowIdx++, "XP Trend", "");
                for (AnalyticsTrendPointDTO t : gamification.getXpEarnedTrend()) createRow(s3, rowIdx++, t.getLabel(), String.valueOf(t.getValue()));
            }

            // Sheet 4: Badges
            Sheet s4 = workbook.createSheet("Badges");
            createRow(s4, 0, "Metric", "Value");
            createRow(s4, 1, "Total Badges Awarded", String.valueOf(badges.getTotalBadgesAwarded()));
            createRow(s4, 2, "Period Badges Awarded", String.valueOf(badges.getBadgesAwardedInPeriod()));
            
            rowIdx = 4;
            createRow(s4, rowIdx++, "Most Awarded Badges", "");
            for (AnalyticsDistributionDTO d : badges.getMostAwardedBadges()) createRow(s4, rowIdx++, d.getCategory(), String.valueOf(d.getValue()));

            rowIdx++;
            createRow(s4, rowIdx++, "Badge Type Distribution", "");
            for (AnalyticsDistributionDTO d : badges.getBadgeTypeDistribution()) createRow(s4, rowIdx++, d.getCategory(), String.valueOf(d.getValue()));

            // Sheet 5: Challenges
            Sheet s5 = workbook.createSheet("Challenges");
            createRow(s5, 0, "Metric", "Value");
            createRow(s5, 1, "Total Challenges in Period", String.valueOf(challenges.getTotalChallenges()));
            createRow(s5, 2, "Active Challenges", String.valueOf(challenges.getActiveChallenges()));
            createRow(s5, 3, "Completed Challenges", String.valueOf(challenges.getCompletedChallenges()));
            createRow(s5, 4, "Pending Challenges", String.valueOf(challenges.getPendingChallenges()));
            createRow(s5, 5, "Upcoming Challenges", String.valueOf(challenges.getUpcomingChallenges()));
            createRow(s5, 6, "Total Participants", String.valueOf(challenges.getTotalParticipants()));
            createRow(s5, 7, "Challenge XP", String.valueOf(challenges.getXpDistributedInPeriod()));
            
            rowIdx = 9;
            createRow(s5, rowIdx++, "Status Distribution", "");
            for (AnalyticsDistributionDTO d : challenges.getStatusDistribution()) createRow(s5, rowIdx++, d.getCategory(), String.valueOf(d.getValue()));

            rowIdx++;
            createRow(s5, rowIdx++, "Category Distribution", "");
            for (AnalyticsDistributionDTO d : challenges.getCategoryDistribution()) createRow(s5, rowIdx++, d.getCategory(), String.valueOf(d.getValue()));

            // Sheet 6: Sustainability
            Sheet s6 = workbook.createSheet("Sustainability");
            createRow(s6, 0, "Metric", "Value");
            createRow(s6, 1, "Total Tracked Emissions", String.valueOf(sustainability.getTotalCarbonImpact()));
            createRow(s6, 2, "Period Tracked Emissions", String.valueOf(sustainability.getCarbonImpactInPeriod()));
            
            rowIdx = 4;
            createRow(s6, rowIdx++, "Category Impact", "");
            for (AnalyticsDistributionDTO d : sustainability.getImpactByCategory()) createRow(s6, rowIdx++, d.getCategory(), String.valueOf(d.getValue()));

            rowIdx++;
            createRow(s6, rowIdx++, "Emission Trend", "");
            for (AnalyticsTrendPointDTO t : sustainability.getCarbonTrend()) createRow(s6, rowIdx++, t.getLabel(), String.valueOf(t.getValue()));

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    private void createRow(Sheet sheet, int rowIndex, String... values) {
        Row row = sheet.createRow(rowIndex);
        for (int i = 0; i < values.length; i++) {
            row.createCell(i).setCellValue(values[i]);
        }
    }
}
