package com.ecotrack.admin.service;

import com.ecotrack.admin.dto.analytics.*;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class AdminPdfExportService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public byte[] exportPdf(AdminAnalyticsFilter filter, AdminOverviewAnalyticsDTO overview, AdminUserAnalyticsDTO users, AdminGamificationAnalyticsDTO gamification, AdminBadgeAnalyticsDTO badges, AdminChallengeAnalyticsDTO challenges, AdminSustainabilityAnalyticsDTO sustainability) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph("EcoTrack Admin Analytics Report"));
            document.add(new Paragraph("Generated: " + LocalDateTime.now().format(FORMATTER)));
            document.add(new Paragraph("Period: " + (filter.getStartDate() != null ? filter.getStartDate() : "All Time") + " to " + (filter.getEndDate() != null ? filter.getEndDate() : "Now")));
            document.add(new Paragraph(" "));

            // Overview
            document.add(new Paragraph("--- Platform Overview ---"));
            document.add(new Paragraph("Total Users: " + overview.getTotalUsers()));
            document.add(new Paragraph("Active Users: " + overview.getActiveUsers()));
            document.add(new Paragraph("Total XP Distributed: " + overview.getTotalXp()));
            document.add(new Paragraph("Badges Awarded: " + overview.getTotalBadgesAwarded()));
            document.add(new Paragraph("Total Challenges: " + overview.getTotalChallenges()));
            document.add(new Paragraph("Total Carbon Tracked (kg): " + overview.getTotalCarbonImpact()));
            document.add(new Paragraph(" "));

            // Users
            document.add(new Paragraph("--- User Analytics ---"));
            document.add(new Paragraph("New Users in Period: " + users.getNewUsersInPeriod()));
            document.add(new Paragraph(" "));

            // Gamification
            document.add(new Paragraph("--- Gamification Analytics ---"));
            document.add(new Paragraph("Total XP: " + gamification.getTotalPlatformXp()));
            document.add(new Paragraph("Period XP: " + gamification.getXpAwardedInPeriod()));
            document.add(new Paragraph("Average Eco Score: " + gamification.getAverageEcoScore()));
            document.add(new Paragraph(" "));

            // Badges
            document.add(new Paragraph("--- Badge Analytics ---"));
            document.add(new Paragraph("Period Badges Awarded: " + badges.getBadgesAwardedInPeriod()));
            document.add(new Paragraph(" "));

            // Challenges
            document.add(new Paragraph("--- Challenge Analytics ---"));
            document.add(new Paragraph("Total Challenges in Period: " + challenges.getTotalChallenges()));
            document.add(new Paragraph("Active Challenges: " + challenges.getActiveChallenges()));
            document.add(new Paragraph("Completed Challenges: " + challenges.getCompletedChallenges()));
            document.add(new Paragraph("Pending Challenges: " + challenges.getPendingChallenges()));
            document.add(new Paragraph("Upcoming Challenges: " + challenges.getUpcomingChallenges()));
            document.add(new Paragraph("Total Participants: " + challenges.getTotalParticipants()));
            document.add(new Paragraph("Challenge XP: " + challenges.getXpDistributedInPeriod()));
            document.add(new Paragraph(" "));

            // Sustainability
            document.add(new Paragraph("--- Sustainability Analytics ---"));
            document.add(new Paragraph("Period Tracked Emissions (kg): " + sustainability.getCarbonImpactInPeriod()));

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }
}
