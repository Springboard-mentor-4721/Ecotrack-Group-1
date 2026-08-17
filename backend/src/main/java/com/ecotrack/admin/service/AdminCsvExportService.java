package com.ecotrack.admin.service;

import com.ecotrack.admin.dto.analytics.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class AdminCsvExportService {

    public byte[] exportCsvZip(AdminAnalyticsFilter filter, AdminOverviewAnalyticsDTO overview, AdminUserAnalyticsDTO users, AdminGamificationAnalyticsDTO gamification, AdminBadgeAnalyticsDTO badges, AdminChallengeAnalyticsDTO challenges, AdminSustainabilityAnalyticsDTO sustainability) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream(); ZipOutputStream zos = new ZipOutputStream(baos)) {
            
            addCsvToZip(zos, "overview.csv", generateOverviewCsv(overview));
            addCsvToZip(zos, "users.csv", generateUsersCsv(users));
            addCsvToZip(zos, "gamification.csv", generateGamificationCsv(gamification));
            addCsvToZip(zos, "badges.csv", generateBadgesCsv(badges));
            addCsvToZip(zos, "challenges.csv", generateChallengesCsv(challenges));
            addCsvToZip(zos, "sustainability.csv", generateSustainabilityCsv(sustainability));

            zos.finish();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV zip", e);
        }
    }

    private void addCsvToZip(ZipOutputStream zos, String filename, String content) throws Exception {
        ZipEntry entry = new ZipEntry(filename);
        zos.putNextEntry(entry);
        zos.write(content.getBytes(StandardCharsets.UTF_8));
        zos.closeEntry();
    }

    private String generateOverviewCsv(AdminOverviewAnalyticsDTO overview) {
        StringBuilder sb = new StringBuilder();
        sb.append("Metric,Value\n");
        sb.append("Total Users,").append(overview.getTotalUsers()).append("\n");
        sb.append("Active Users,").append(overview.getActiveUsers()).append("\n");
        sb.append("Total XP Distributed,").append(overview.getTotalXp()).append("\n");
        sb.append("Badges Awarded,").append(overview.getTotalBadgesAwarded()).append("\n");
        sb.append("Total Challenges,").append(overview.getTotalChallenges()).append("\n");
        sb.append("Total Carbon Tracked (kg),").append(overview.getTotalCarbonImpact()).append("\n");
        sb.append("Active Challenges,").append(overview.getActiveChallenges()).append("\n");
        sb.append("Completed Challenges,").append(overview.getCompletedChallenges()).append("\n");
        sb.append("Challenge XP Distributed,").append(overview.getTotalChallengeXp()).append("\n");
        return sb.toString();
    }

    private String generateUsersCsv(AdminUserAnalyticsDTO users) {
        StringBuilder sb = new StringBuilder();
        sb.append("Metric,Value\n");
        sb.append("Total Users,").append(users.getTotalUsers()).append("\n");
        sb.append("New Users in Period,").append(users.getNewUsersInPeriod()).append("\n\n");
        
        sb.append("Status Distribution,Value\n");
        for (AnalyticsDistributionDTO d : users.getStatusDistribution()) sb.append(escapeCsv(d.getCategory())).append(",").append(d.getValue()).append("\n");
        
        sb.append("\nRole Distribution,Value\n");
        for (AnalyticsDistributionDTO d : users.getRoleDistribution()) sb.append(escapeCsv(d.getCategory())).append(",").append(d.getValue()).append("\n");

        sb.append("\nRegistration Trend,Value\n");
        for (AnalyticsTrendPointDTO t : users.getRegistrationTrend()) sb.append(escapeCsv(t.getLabel())).append(",").append(t.getValue()).append("\n");
        return sb.toString();
    }

    private String generateGamificationCsv(AdminGamificationAnalyticsDTO gamification) {
        StringBuilder sb = new StringBuilder();
        sb.append("Metric,Value\n");
        sb.append("Total XP,").append(gamification.getTotalPlatformXp()).append("\n");
        sb.append("Period XP,").append(gamification.getXpAwardedInPeriod()).append("\n");
        sb.append("Average Eco Score,").append(gamification.getAverageEcoScore()).append("\n\n");
        
        sb.append("XP Source Distribution,Value\n");
        for (AnalyticsDistributionDTO d : gamification.getXpSourceDistribution()) sb.append(escapeCsv(d.getCategory())).append(",").append(d.getValue()).append("\n");
        
        sb.append("\nLevel Distribution,Value\n");
        for (AnalyticsDistributionDTO d : gamification.getLevelDistribution()) sb.append(escapeCsv(d.getCategory())).append(",").append(d.getValue()).append("\n");

        if (gamification.getXpEarnedTrend() != null) {
            sb.append("\nXP Trend,Value\n");
            for (AnalyticsTrendPointDTO t : gamification.getXpEarnedTrend()) sb.append(escapeCsv(t.getLabel())).append(",").append(t.getValue()).append("\n");
        }
        return sb.toString();
    }

    private String generateBadgesCsv(AdminBadgeAnalyticsDTO badges) {
        StringBuilder sb = new StringBuilder();
        sb.append("Metric,Value\n");
        sb.append("Total Badges Awarded,").append(badges.getTotalBadgesAwarded()).append("\n");
        sb.append("Period Badges Awarded,").append(badges.getBadgesAwardedInPeriod()).append("\n\n");
        
        sb.append("Most Awarded Badges,Value\n");
        for (AnalyticsDistributionDTO d : badges.getMostAwardedBadges()) sb.append(escapeCsv(d.getCategory())).append(",").append(d.getValue()).append("\n");

        sb.append("\nBadge Type Distribution,Value\n");
        for (AnalyticsDistributionDTO d : badges.getBadgeTypeDistribution()) sb.append(escapeCsv(d.getCategory())).append(",").append(d.getValue()).append("\n");
        return sb.toString();
    }

    private String generateChallengesCsv(AdminChallengeAnalyticsDTO challenges) {
        StringBuilder sb = new StringBuilder();
        sb.append("Metric,Value\n");
        sb.append("Total Challenges in Period,").append(challenges.getTotalChallenges()).append("\n");
        sb.append("Active Challenges,").append(challenges.getActiveChallenges()).append("\n");
        sb.append("Completed Challenges,").append(challenges.getCompletedChallenges()).append("\n");
        sb.append("Pending Challenges,").append(challenges.getPendingChallenges()).append("\n");
        sb.append("Upcoming Challenges,").append(challenges.getUpcomingChallenges()).append("\n");
        sb.append("Total Participants,").append(challenges.getTotalParticipants()).append("\n");
        sb.append("Challenge XP,").append(challenges.getXpDistributedInPeriod()).append("\n\n");
        
        sb.append("Status Distribution,Value\n");
        for (AnalyticsDistributionDTO d : challenges.getStatusDistribution()) sb.append(escapeCsv(d.getCategory())).append(",").append(d.getValue()).append("\n");

        sb.append("\nCategory Distribution,Value\n");
        for (AnalyticsDistributionDTO d : challenges.getCategoryDistribution()) sb.append(escapeCsv(d.getCategory())).append(",").append(d.getValue()).append("\n");
        return sb.toString();
    }

    private String generateSustainabilityCsv(AdminSustainabilityAnalyticsDTO sustainability) {
        StringBuilder sb = new StringBuilder();
        sb.append("Metric,Value\n");
        sb.append("Total Tracked Emissions,").append(sustainability.getTotalCarbonImpact()).append("\n");
        sb.append("Period Tracked Emissions,").append(sustainability.getCarbonImpactInPeriod()).append("\n\n");
        
        sb.append("Category Impact,Value\n");
        for (AnalyticsDistributionDTO d : sustainability.getImpactByCategory()) sb.append(escapeCsv(d.getCategory())).append(",").append(d.getValue()).append("\n");

        sb.append("\nEmission Trend,Value\n");
        for (AnalyticsTrendPointDTO t : sustainability.getCarbonTrend()) sb.append(escapeCsv(t.getLabel())).append(",").append(t.getValue()).append("\n");
        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
