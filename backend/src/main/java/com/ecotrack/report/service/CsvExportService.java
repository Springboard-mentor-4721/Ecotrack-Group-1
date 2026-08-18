package com.ecotrack.report.service;

import com.ecotrack.report.dto.CarbonReportDTO;
import com.ecotrack.report.dto.ChallengeReportDTO;
import com.ecotrack.report.dto.GoalReportDTO;
import com.ecotrack.report.dto.SustainabilityReportDTO;
import com.ecotrack.report.dto.XpTransactionDTO;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class CsvExportService {

    public byte[] exportCarbonReport(CarbonReportDTO report) {
        StringBuilder sb = new StringBuilder();
        sb.append("EcoTrack Carbon Footprint Report\n");
        sb.append("Period:,").append(report.getStartDate()).append(" to ").append(report.getEndDate()).append("\n");
        sb.append("Total Emissions (kg CO2e):,").append(report.getTotalEmissions() != null ? report.getTotalEmissions().toString() : "0").append("\n\n");
        
        sb.append("Category,Emissions (kg CO2e)\n");
        if (report.getEmissionsByCategory() != null) {
            for (Map.Entry<String, java.math.BigDecimal> entry : report.getEmissionsByCategory().entrySet()) {
                sb.append(escapeCsv(entry.getKey())).append(",").append(entry.getValue()).append("\n");
            }
        }
        sb.append("\n");

        sb.append("Date,Category,Subcategory,Emission,Description\n");
        if (report.getEntries() != null) {
            for (CarbonReportDTO.CarbonEntryDetail detail : report.getEntries()) {
                sb.append(escapeCsv(detail.getDate())).append(",")
                  .append(escapeCsv(detail.getCategory())).append(",")
                  .append(escapeCsv(detail.getSubCategory())).append(",")
                  .append(detail.getEmission()).append(",")
                  .append(escapeCsv(detail.getDescription())).append("\n");
            }
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportGoalReport(GoalReportDTO report) {
        StringBuilder sb = new StringBuilder();
        sb.append("EcoTrack Goal Achievement Report\n");
        sb.append("Period:,").append(report.getStartDate()).append(" to ").append(report.getEndDate()).append("\n");
        sb.append("Total Goals:,").append(report.getTotalGoals()).append("\n");
        sb.append("Active Goals:,").append(report.getActiveGoals()).append("\n");
        sb.append("Completed Goals:,").append(report.getCompletedGoals()).append("\n");
        sb.append("Failed/Abandoned Goals:,").append(report.getFailedGoals()).append("\n\n");

        sb.append("Title,Type,Status,Progress,Target Value,Target Date\n");
        if (report.getGoals() != null) {
            for (GoalReportDTO.GoalDetail detail : report.getGoals()) {
                sb.append(escapeCsv(detail.getTitle())).append(",")
                  .append(escapeCsv(detail.getType())).append(",")
                  .append(escapeCsv(detail.getStatus())).append(",")
                  .append(detail.getProgressPercentage()).append("%,")
                  .append(detail.getTargetValue()).append(" ").append(escapeCsv(detail.getUnit())).append(",")
                  .append(escapeCsv(detail.getTargetDate())).append("\n");
            }
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportChallengeReport(ChallengeReportDTO report) {
        StringBuilder sb = new StringBuilder();
        sb.append("EcoTrack Challenge Participation Report\n");
        sb.append("Period:,").append(report.getStartDate()).append(" to ").append(report.getEndDate()).append("\n");
        sb.append("Total Participated:,").append(report.getTotalParticipated()).append("\n");
        sb.append("Completed Challenges:,").append(report.getCompletedChallenges()).append("\n");
        sb.append("Total XP Earned:,").append(report.getTotalXpEarned()).append("\n\n");

        sb.append("Title,Category,Status,Progress,XP Earned,Joined Date,Completed Date\n");
        if (report.getChallenges() != null) {
            for (ChallengeReportDTO.ChallengeDetail detail : report.getChallenges()) {
                sb.append(escapeCsv(detail.getTitle())).append(",")
                  .append(escapeCsv(detail.getCategory())).append(",")
                  .append(escapeCsv(detail.getStatus())).append(",")
                  .append(detail.getProgressPercentage()).append("%,")
                  .append(detail.getXpEarned()).append(",")
                  .append(escapeCsv(detail.getJoinedDate())).append(",")
                  .append(escapeCsv(detail.getCompletedDate())).append("\n");
            }
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportSustainabilityReport(SustainabilityReportDTO report) {
        try (java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
             java.util.zip.ZipOutputStream zos = new java.util.zip.ZipOutputStream(baos)) {

            // overview.csv
            zos.putNextEntry(new java.util.zip.ZipEntry("overview.csv"));
            StringBuilder sb = new StringBuilder();
            sb.append("user_name,user_email,reporting_period_start,reporting_period_end,total_emissions_kg_co2e,eco_score,completed_goals,completed_challenges,current_rank\n");
            sb.append(escapeCsv(report.getUserName())).append(",")
              .append(escapeCsv(report.getUserEmail())).append(",")
              .append(escapeCsv(report.getStartDate())).append(",")
              .append(escapeCsv(report.getEndDate())).append(",")
              .append(report.getCarbonReport() != null && report.getCarbonReport().getTotalEmissions() != null ? report.getCarbonReport().getTotalEmissions() : "").append(",")
              .append(report.getCurrentEcoScore()).append(",")
              .append(report.getGoalReport() != null ? report.getGoalReport().getCompletedGoals() : 0).append(",")
              .append(report.getChallengeReport() != null ? report.getChallengeReport().getCompletedChallenges() : 0).append(",")
              .append(escapeCsv(report.getCurrentRank())).append("\n");
            zos.write(sb.toString().getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            // carbon.csv
            zos.putNextEntry(new java.util.zip.ZipEntry("carbon.csv"));
            sb = new StringBuilder();
            sb.append("date,category,sub_category,emissions_kg_co2e,description\n");
            if (report.getCarbonReport() != null && report.getCarbonReport().getEntries() != null) {
                for (CarbonReportDTO.CarbonEntryDetail d : report.getCarbonReport().getEntries()) {
                    sb.append(escapeCsv(com.ecotrack.report.design.ReportFormatUtils.formatStringDate(d.getDate()))).append(",")
                      .append(escapeCsv(com.ecotrack.report.design.ReportFormatUtils.toHumanReadable(d.getCategory()))).append(",")
                      .append(escapeCsv(com.ecotrack.report.design.ReportFormatUtils.toHumanReadable(d.getSubCategory()))).append(",")
                      .append(d.getEmission() != null ? d.getEmission() : "").append(",")
                      .append(escapeCsv(d.getDescription())).append("\n");
                }
            }
            zos.write(sb.toString().getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            // goals.csv
            zos.putNextEntry(new java.util.zip.ZipEntry("goals.csv"));
            sb = new StringBuilder();
            sb.append("goal_name,goal_type,status,progress,target,target_date,unit\n");
            if (report.getGoalReport() != null && report.getGoalReport().getGoals() != null) {
                for (GoalReportDTO.GoalDetail d : report.getGoalReport().getGoals()) {
                    sb.append(escapeCsv(d.getTitle())).append(",")
                      .append(escapeCsv(com.ecotrack.report.design.ReportFormatUtils.toHumanReadable(d.getType()))).append(",")
                      .append(escapeCsv(com.ecotrack.report.design.ReportFormatUtils.toHumanReadable(d.getStatus()))).append(",")
                      .append(d.getProgressPercentage() != null ? d.getProgressPercentage() : "").append(",")
                      .append(d.getTargetValue() != null ? d.getTargetValue() : "").append(",")
                      .append(escapeCsv(com.ecotrack.report.design.ReportFormatUtils.formatStringDate(d.getTargetDate()))).append(",")
                      .append(escapeCsv(d.getUnit())).append("\n");
                }
            }
            zos.write(sb.toString().getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            // challenges.csv
            zos.putNextEntry(new java.util.zip.ZipEntry("challenges.csv"));
            sb = new StringBuilder();
            sb.append("challenge_name,category,status,progress,xp_earned,joined_date,completion_date\n");
            if (report.getChallengeReport() != null && report.getChallengeReport().getChallenges() != null) {
                for (ChallengeReportDTO.ChallengeDetail d : report.getChallengeReport().getChallenges()) {
                    sb.append(escapeCsv(d.getTitle())).append(",")
                      .append(escapeCsv(com.ecotrack.report.design.ReportFormatUtils.toHumanReadable(d.getCategory()))).append(",")
                      .append(escapeCsv(com.ecotrack.report.design.ReportFormatUtils.toHumanReadable(d.getStatus()))).append(",")
                      .append(d.getProgressPercentage()).append(",")
                      .append(d.getXpEarned()).append(",")
                      .append(escapeCsv(com.ecotrack.report.design.ReportFormatUtils.formatStringDate(d.getJoinedDate()))).append(",")
                      .append(escapeCsv(com.ecotrack.report.design.ReportFormatUtils.formatStringDate(d.getCompletedDate()))).append("\n");
                }
            }
            zos.write(sb.toString().getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            // gamification.csv
            zos.putNextEntry(new java.util.zip.ZipEntry("gamification.csv"));
            sb = new StringBuilder();
            sb.append("date,activity,xp,source\n");
            if (report.getXpTransactions() != null && !report.getXpTransactions().isEmpty()) {
                for (XpTransactionDTO tx : report.getXpTransactions()) {
                    sb.append(escapeCsv(com.ecotrack.report.design.ReportFormatUtils.formatStringDate(tx.getTimestamp()))).append(",")
                      .append(escapeCsv(tx.getDescription())).append(",")
                      .append(tx.getAmount()).append(",")
                      .append(escapeCsv(tx.getSource())).append("\n");
                }
            }
            zos.write(sb.toString().getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            zos.finish();
            return baos.toByteArray();
        } catch (java.io.IOException e) {
            throw new RuntimeException("Error generating ZIP export", e);
        }
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        String result = value;
        if (result.contains("\"")) {
            result = result.replace("\"", "\"\"");
        }
        if (result.contains(",") || result.contains("\n") || result.contains("\"")) {
            return "\"" + result + "\"";
        }
        return result;
    }
}
