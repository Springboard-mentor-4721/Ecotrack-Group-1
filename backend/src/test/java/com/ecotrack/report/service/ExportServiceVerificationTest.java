package com.ecotrack.report.service;

import com.ecotrack.report.dto.CarbonReportDTO;
import com.ecotrack.report.dto.ChallengeReportDTO;
import com.ecotrack.report.dto.GoalReportDTO;
import com.ecotrack.report.dto.SustainabilityReportDTO;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ExportServiceVerificationTest {

    private final PdfExportService pdfExportService = new PdfExportService();
    private final ExcelExportService excelExportService = new ExcelExportService();

    @Test
    void testCarbonPdfExport() throws Exception {
        CarbonReportDTO dto = CarbonReportDTO.builder()
                .startDate("2026-08-01")
                .endDate("2026-08-31")
                .totalEmissions(new BigDecimal("125.5"))
                .emissionsByCategory(Map.of("Transport", new BigDecimal("100"), "Energy", new BigDecimal("25.5")))
                .entries(List.of(
                        CarbonReportDTO.CarbonEntryDetail.builder()
                                .date("2026-08-10")
                                .category("Transport")
                                .subCategory("Car")
                                .emission(new BigDecimal("50.0"))
                                .description("Drive to work")
                                .build()
                ))
                .build();

        byte[] pdfBytes = pdfExportService.exportCarbonReport(dto);
        assertTrue(pdfBytes.length > 0);

        PdfReader reader = new PdfReader(pdfBytes);
        PdfTextExtractor extractor = new PdfTextExtractor(reader);
        String text = extractor.getTextFromPage(1);
        
        assertTrue(text != null);
    }

    @Test
    void testCarbonExcelExport() throws Exception {
        CarbonReportDTO dto = CarbonReportDTO.builder()
                .startDate("2026-08-01")
                .endDate("2026-08-31")
                .totalEmissions(new BigDecimal("125.5"))
                .emissionsByCategory(Map.of("Transport", new BigDecimal("100"), "Energy", new BigDecimal("25.5")))
                .entries(List.of(
                        CarbonReportDTO.CarbonEntryDetail.builder()
                                .date("2026-08-10")
                                .category("Transport")
                                .subCategory("Car")
                                .emission(new BigDecimal("50.0"))
                                .description("Drive to work")
                                .build()
                ))
                .build();

        byte[] excelBytes = excelExportService.exportCarbonReport(dto);
        assertTrue(excelBytes.length > 0);

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excelBytes))) {
            Sheet summarySheet = workbook.getSheet("Summary");
            assertEquals("EcoTrack Carbon Footprint Report", summarySheet.getRow(0).getCell(0).getStringCellValue());
            assertEquals("125.5", summarySheet.getRow(2).getCell(1).getStringCellValue());
            
            Sheet entriesSheet = workbook.getSheet("Entries");
            assertEquals("2026-08-10", entriesSheet.getRow(1).getCell(0).getStringCellValue());
            assertEquals("Drive to work", entriesSheet.getRow(1).getCell(4).getStringCellValue());
        }
    }
}
