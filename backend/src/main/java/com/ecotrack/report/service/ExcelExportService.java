package com.ecotrack.report.service;

import com.ecotrack.report.dto.CarbonReportDTO;
import com.ecotrack.report.dto.ChallengeReportDTO;
import com.ecotrack.report.dto.GoalReportDTO;
import com.ecotrack.report.dto.SustainabilityReportDTO;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Map;

@Service
public class ExcelExportService {

    public byte[] exportCarbonReport(CarbonReportDTO report) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet summarySheet = workbook.createSheet("Summary");
            createRow(summarySheet, 0, "EcoTrack Carbon Footprint Report");
            createRow(summarySheet, 1, "Period:", report.getStartDate() + " to " + report.getEndDate());
            createRow(summarySheet, 2, "Total Emissions (kg CO2e):", report.getTotalEmissions() != null ? report.getTotalEmissions().toString() : "0");
            
            if (report.getEmissionsByCategory() != null) {
                int rowNum = 4;
                createRow(summarySheet, rowNum++, "Category", "Emissions (kg CO2e)");
                for (Map.Entry<String, java.math.BigDecimal> entry : report.getEmissionsByCategory().entrySet()) {
                    createRow(summarySheet, rowNum++, entry.getKey(), entry.getValue().toString());
                }
            }

            if (report.getEntries() != null) {
                Sheet entriesSheet = workbook.createSheet("Entries");
                createRow(entriesSheet, 0, "Date", "Category", "Subcategory", "Emission", "Description");
                int rowNum = 1;
                for (CarbonReportDTO.CarbonEntryDetail detail : report.getEntries()) {
                    createRow(entriesSheet, rowNum++, detail.getDate(), detail.getCategory(), detail.getSubCategory(), 
                              detail.getEmission().toString(), detail.getDescription());
                }
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    public byte[] exportGoalReport(GoalReportDTO report) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet summarySheet = workbook.createSheet("Summary");
            createRow(summarySheet, 0, "EcoTrack Goal Achievement Report");
            createRow(summarySheet, 1, "Period:", report.getStartDate() + " to " + report.getEndDate());
            createRow(summarySheet, 2, "Total Goals:", String.valueOf(report.getTotalGoals()));
            createRow(summarySheet, 3, "Active Goals:", String.valueOf(report.getActiveGoals()));
            createRow(summarySheet, 4, "Completed Goals:", String.valueOf(report.getCompletedGoals()));
            createRow(summarySheet, 5, "Failed/Abandoned Goals:", String.valueOf(report.getFailedGoals()));
            
            if (report.getGoals() != null) {
                Sheet goalsSheet = workbook.createSheet("Goals");
                createRow(goalsSheet, 0, "Title", "Type", "Status", "Progress", "Target Value", "Target Date");
                int rowNum = 1;
                for (GoalReportDTO.GoalDetail detail : report.getGoals()) {
                    createRow(goalsSheet, rowNum++, detail.getTitle(), detail.getType(), detail.getStatus(), 
                              detail.getProgressPercentage() + "%", detail.getTargetValue() + " " + detail.getUnit(), detail.getTargetDate());
                }
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    public byte[] exportChallengeReport(ChallengeReportDTO report) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet summarySheet = workbook.createSheet("Summary");
            createRow(summarySheet, 0, "EcoTrack Challenge Participation Report");
            createRow(summarySheet, 1, "Period:", report.getStartDate() + " to " + report.getEndDate());
            createRow(summarySheet, 2, "Total Participated:", String.valueOf(report.getTotalParticipated()));
            createRow(summarySheet, 3, "Completed Challenges:", String.valueOf(report.getCompletedChallenges()));
            createRow(summarySheet, 4, "Total XP Earned:", String.valueOf(report.getTotalXpEarned()));
            
            if (report.getChallenges() != null) {
                Sheet partsSheet = workbook.createSheet("Participation");
                createRow(partsSheet, 0, "Title", "Category", "Status", "Progress", "XP Earned", "Joined Date", "Completed Date");
                int rowNum = 1;
                for (ChallengeReportDTO.ChallengeDetail detail : report.getChallenges()) {
                    createRow(partsSheet, rowNum++, detail.getTitle(), detail.getCategory(), detail.getStatus(), 
                              detail.getProgressPercentage() + "%", String.valueOf(detail.getXpEarned()), 
                              detail.getJoinedDate(), detail.getCompletedDate() == null ? "" : detail.getCompletedDate());
                }
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    public byte[] exportSustainabilityReport(SustainabilityReportDTO report) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet overviewSheet = workbook.createSheet("Overview");
            createRow(overviewSheet, 0, "EcoTrack Sustainability Report");
            createRow(overviewSheet, 1, "Period:", report.getStartDate() + " to " + report.getEndDate());
            
            createRow(overviewSheet, 3, "Carbon Emissions (kg CO2e):", report.getTotalEmissions() != null ? report.getTotalEmissions().toString() : "0");
            
            createRow(overviewSheet, 5, "Total Goals:", String.valueOf(report.getTotalGoals()));
            createRow(overviewSheet, 6, "Completed Goals:", String.valueOf(report.getCompletedGoals()));
            
            createRow(overviewSheet, 8, "Completed Challenges:", String.valueOf(report.getCompletedChallenges()));
            createRow(overviewSheet, 9, "XP Earned:", String.valueOf(report.getXpEarned()));
            
            createRow(overviewSheet, 11, "Current EcoScore:", String.valueOf(report.getCurrentEcoScore()));
            createRow(overviewSheet, 12, "Current Rank:", report.getCurrentRank());

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    private void createRow(Sheet sheet, int rowNum, String... values) {
        Row row = sheet.createRow(rowNum);
        for (int i = 0; i < values.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(values[i] != null ? values[i] : "");
        }
    }
}
