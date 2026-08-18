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

    public byte[] exportCarbonReport(CarbonReportDTO report, com.ecotrack.report.design.ReportTheme theme) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            org.apache.poi.ss.usermodel.CellStyle headerStyle = createHeaderStyle(workbook, theme);
            Sheet summarySheet = workbook.createSheet("Summary");
            createStyledRow(summarySheet, 0, headerStyle, "EcoTrack Carbon Footprint Report");
            createRow(summarySheet, 1, "Period:", report.getStartDate() + " to " + report.getEndDate());
            createRow(summarySheet, 2, "Total Emissions (kg CO2e):", report.getTotalEmissions() != null ? report.getTotalEmissions().toString() : "0");
            
            if (report.getEmissionsByCategory() != null) {
                int rowNum = 4;
                createStyledRow(summarySheet, rowNum++, headerStyle, "Category", "Emissions (kg CO2e)");
                for (Map.Entry<String, java.math.BigDecimal> entry : report.getEmissionsByCategory().entrySet()) {
                    createRow(summarySheet, rowNum++, entry.getKey(), entry.getValue().toString());
                }
            }

            if (report.getEntries() != null) {
                Sheet entriesSheet = workbook.createSheet("Entries");
                createStyledRow(entriesSheet, 0, headerStyle, "Date", "Category", "Subcategory", "Emission", "Description");
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

    public byte[] exportGoalReport(GoalReportDTO report, com.ecotrack.report.design.ReportTheme theme) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            org.apache.poi.ss.usermodel.CellStyle headerStyle = createHeaderStyle(workbook, theme);
            Sheet summarySheet = workbook.createSheet("Summary");
            createStyledRow(summarySheet, 0, headerStyle, "EcoTrack Goal Achievement Report");
            createRow(summarySheet, 1, "Period:", report.getStartDate() + " to " + report.getEndDate());
            createRow(summarySheet, 2, "Total Goals:", String.valueOf(report.getTotalGoals()));
            createRow(summarySheet, 3, "Active Goals:", String.valueOf(report.getActiveGoals()));
            createRow(summarySheet, 4, "Completed Goals:", String.valueOf(report.getCompletedGoals()));
            createRow(summarySheet, 5, "Failed/Abandoned Goals:", String.valueOf(report.getFailedGoals()));
            
            if (report.getGoals() != null) {
                Sheet goalsSheet = workbook.createSheet("Goals");
                createStyledRow(goalsSheet, 0, headerStyle, "Title", "Type", "Status", "Progress", "Target Value", "Target Date");
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

    public byte[] exportChallengeReport(ChallengeReportDTO report, com.ecotrack.report.design.ReportTheme theme) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            org.apache.poi.ss.usermodel.CellStyle headerStyle = createHeaderStyle(workbook, theme);
            Sheet summarySheet = workbook.createSheet("Summary");
            createStyledRow(summarySheet, 0, headerStyle, "EcoTrack Challenge Participation Report");
            createRow(summarySheet, 1, "Period:", report.getStartDate() + " to " + report.getEndDate());
            createRow(summarySheet, 2, "Total Participated:", String.valueOf(report.getTotalParticipated()));
            createRow(summarySheet, 3, "Completed Challenges:", String.valueOf(report.getCompletedChallenges()));
            createRow(summarySheet, 4, "Total XP Earned:", String.valueOf(report.getTotalXpEarned()));
            
            if (report.getChallenges() != null) {
                Sheet partsSheet = workbook.createSheet("Participation");
                createStyledRow(partsSheet, 0, headerStyle, "Title", "Category", "Status", "Progress", "XP Earned", "Joined Date", "Completed Date");
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

    public byte[] exportSustainabilityReport(SustainabilityReportDTO report, com.ecotrack.report.design.ReportTheme theme) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            org.apache.poi.ss.usermodel.CellStyle headerStyle = createHeaderStyle(workbook, theme);
            Sheet overviewSheet = workbook.createSheet("Overview");
            createStyledRow(overviewSheet, 0, headerStyle, "EcoTrack Sustainability Report");
            createRow(overviewSheet, 1, "Period:", report.getStartDate() + " to " + report.getEndDate());
            
            int rowNum = 3;
            Row row = overviewSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Total Emissions (kg CO₂e)");
            row.createCell(1).setCellValue(report.getCarbonReport() != null && report.getCarbonReport().getTotalEmissions() != null ? report.getCarbonReport().getTotalEmissions().doubleValue() : 0.0);
            
            row = overviewSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Goals Completed / Total");
            row.createCell(1).setCellValue((report.getGoalReport() != null ? report.getGoalReport().getCompletedGoals() : 0) + " / " + (report.getGoalReport() != null ? report.getGoalReport().getTotalGoals() : 0));
            
            row = overviewSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Challenges Completed");
            row.createCell(1).setCellValue(report.getChallengeReport() != null ? report.getChallengeReport().getCompletedChallenges() : 0);
            
            row = overviewSheet.createRow(rowNum++);
            row.createCell(0).setCellValue("XP Earned");
            row.createCell(1).setCellValue(report.getChallengeReport() != null ? report.getChallengeReport().getTotalXpEarned() : 0);
            
            createStyledRow(overviewSheet, 11, headerStyle, "Current EcoScore:", String.valueOf(report.getCurrentEcoScore()));
            createRow(overviewSheet, 12, "Current Rank:", report.getCurrentRank());

            if (report.getCarbonReport() != null && report.getCarbonReport().getEntries() != null) {
                Sheet carbonSheet = workbook.createSheet("Carbon");
                createStyledRow(carbonSheet, 0, headerStyle, "Date", "Category", "Sub-Category", "Activity", "Emissions (kg CO₂e)");
                int rowNumCarbon = 1;
                for (com.ecotrack.report.dto.CarbonReportDTO.CarbonEntryDetail detail : report.getCarbonReport().getEntries()) {
                    createRow(carbonSheet, rowNumCarbon++, 
                        com.ecotrack.report.design.ReportFormatUtils.formatStringDate(detail.getDate()), 
                        com.ecotrack.report.design.ReportFormatUtils.toHumanReadable(detail.getCategory()), 
                        com.ecotrack.report.design.ReportFormatUtils.toHumanReadable(detail.getSubCategory()), 
                        detail.getDescription(), 
                        detail.getEmission() != null ? String.valueOf(detail.getEmission()) : "0");
                }
            }

            if (report.getGoalReport() != null && report.getGoalReport().getGoals() != null) {
                Sheet goalsSheet = workbook.createSheet("Goals");
                createStyledRow(goalsSheet, 0, headerStyle, "Goal", "Goal Type", "Status", "Target", "Current Progress", "Progress %", "Target Date");
                int rowNumGoals = 1;
                for (com.ecotrack.report.dto.GoalReportDTO.GoalDetail detail : report.getGoalReport().getGoals()) {
                    createRow(goalsSheet, rowNumGoals++, 
                        detail.getTitle(), 
                        com.ecotrack.report.design.ReportFormatUtils.toHumanReadable(detail.getType()), 
                        com.ecotrack.report.design.ReportFormatUtils.toHumanReadable(detail.getStatus()), 
                        detail.getTargetValue() + " " + detail.getUnit(), 
                        detail.getCurrentValue() != null ? detail.getCurrentValue() + " " + detail.getUnit() : "", 
                        detail.getProgressPercentage() + "%", 
                        com.ecotrack.report.design.ReportFormatUtils.formatStringDate(detail.getTargetDate()));
                }
            }

            if (report.getChallengeReport() != null && report.getChallengeReport().getChallenges() != null) {
                Sheet challengesSheet = workbook.createSheet("Challenges");
                createStyledRow(challengesSheet, 0, headerStyle, "Challenge", "Status", "Start Date", "End Date", "XP Earned");
                int rowNumChall = 1;
                for (com.ecotrack.report.dto.ChallengeReportDTO.ChallengeDetail detail : report.getChallengeReport().getChallenges()) {
                    createRow(challengesSheet, rowNumChall++, 
                        detail.getTitle(), 
                        com.ecotrack.report.design.ReportFormatUtils.toHumanReadable(detail.getStatus()), 
                        com.ecotrack.report.design.ReportFormatUtils.formatStringDate(detail.getJoinedDate()), 
                        detail.getCompletedDate() != null ? com.ecotrack.report.design.ReportFormatUtils.formatStringDate(detail.getCompletedDate()) : "", 
                        String.valueOf(detail.getXpEarned()));
                }
            }

            Sheet gamificationSheet = workbook.createSheet("Gamification");
            createStyledRow(gamificationSheet, 0, headerStyle, "Date", "XP Source", "XP Amount", "Description");
            if (report.getXpTransactions() != null) {
                int xpRowNum = 1;
                for (com.ecotrack.report.dto.XpTransactionDTO tx : report.getXpTransactions()) {
                    createRow(gamificationSheet, xpRowNum++, 
                        com.ecotrack.report.design.ReportFormatUtils.formatStringDate(tx.getTimestamp()), 
                        com.ecotrack.report.design.ReportFormatUtils.toHumanReadable(tx.getSource()), 
                        String.valueOf(tx.getAmount()), 
                        tx.getDescription());
                }
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    private void createStyledRow(Sheet sheet, int rowNum, org.apache.poi.ss.usermodel.CellStyle style, String... values) {
        Row row = sheet.createRow(rowNum);
        for (int i = 0; i < values.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(values[i] != null ? values[i] : "");
            if (style != null) {
                cell.setCellStyle(style);
            }
        }
    }
    
    private void createRow(Sheet sheet, int rowNum, String... values) {
        createStyledRow(sheet, rowNum, null, values);
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
            // Defaulting header text color to dark or white depending on theme
            // Wait, theme has getTextColor(), but we can just use white if it's emerald, or text color if light.
            // Let's just use text color for simplicity.
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
