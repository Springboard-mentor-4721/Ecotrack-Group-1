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
        StringBuilder sb = new StringBuilder();
        sb.append("EcoTrack Sustainability Report\n");
        sb.append("Period:,").append(report.getStartDate()).append(" to ").append(report.getEndDate()).append("\n\n");
        
        sb.append("Carbon Emissions (kg CO2e):,").append(report.getTotalEmissions() != null ? report.getTotalEmissions().toString() : "0").append("\n");
        sb.append("Total Goals:,").append(report.getTotalGoals()).append("\n");
        sb.append("Completed Goals:,").append(report.getCompletedGoals()).append("\n");
        sb.append("Completed Challenges:,").append(report.getCompletedChallenges()).append("\n");
        sb.append("XP Earned:,").append(report.getXpEarned()).append("\n");
        sb.append("Current EcoScore:,").append(report.getCurrentEcoScore()).append("\n");
        sb.append("Current Rank:,").append(escapeCsv(report.getCurrentRank())).append("\n\n");

        if (report.getXpTransactions() != null && !report.getXpTransactions().isEmpty()) {
            sb.append("XP Activity\n");
            sb.append("Date,Activity,XP Amount\n");
            for (XpTransactionDTO tx : report.getXpTransactions()) {
                sb.append(escapeCsv(tx.getTimestamp())).append(",")
                  .append(escapeCsv(tx.getDescription())).append(",")
                  .append(tx.getAmount() > 0 ? "+" : "").append(tx.getAmount()).append("\n");
            }
        }
        
        return sb.toString().getBytes(StandardCharsets.UTF_8);
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
