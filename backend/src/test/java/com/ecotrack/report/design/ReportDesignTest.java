package com.ecotrack.report.design;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class ReportDesignTest {

    @Test
    public void testFormatDate() {
        assertEquals("17 Aug 2026", ReportFormatUtils.formatDate(LocalDate.of(2026, 8, 17)));
        assertEquals("N/A", ReportFormatUtils.formatDate(null));
    }

    @Test
    public void testFormatDateRange() {
        assertEquals("18 Jul 2026 \u2013 17 Aug 2026", ReportFormatUtils.formatDateRange(LocalDate.of(2026, 7, 18), LocalDate.of(2026, 8, 17)));
        assertEquals("All Time \u2013 Now", ReportFormatUtils.formatDateRange(null, null));
    }

    @Test
    public void testFormatDateTime() {
        assertEquals("17 Aug 2026, 6:23 PM", ReportFormatUtils.formatDateTime(LocalDateTime.of(2026, 8, 17, 18, 23)));
        assertEquals("N/A", ReportFormatUtils.formatDateTime(null));
    }

    @Test
    public void testFormatCarbon() {
        assertEquals("326.75 kg CO₂e", ReportFormatUtils.formatCarbon(new BigDecimal("326.7500")));
        assertEquals("0 kg CO₂e", ReportFormatUtils.formatCarbon(null));
    }

    @Test
    public void testFormatPercentage() {
        assertEquals("38.5%", ReportFormatUtils.formatPercentage(new BigDecimal("38.5")));
        assertEquals("100.0%", ReportFormatUtils.formatPercentage(100.0));
        assertEquals("0.0%", ReportFormatUtils.formatPercentage((BigDecimal) null));
    }

    @Test
    public void testFormatCount() {
        assertEquals("1,225", ReportFormatUtils.formatCount(1225L));
        assertEquals("0", ReportFormatUtils.formatCount((Integer) null));
    }

    @Test
    public void testChartUtility() {
        ReportChartService chartService = new ReportChartService();
        
        // Test empty data
        assertEquals(0, chartService.generatePieChart("Empty", new HashMap<>(), com.ecotrack.report.design.ReportTheme.EMERALD).length);
        
        // Test valid pie chart
        Map<String, BigDecimal> data = new HashMap<>();
        data.put("Travel", new BigDecimal("15.0"));
        data.put("Electricity", new BigDecimal("51.0"));
        byte[] pieBytes = chartService.generatePieChart("Test Pie", data, com.ecotrack.report.design.ReportTheme.EMERALD);
        assertTrue(pieBytes.length > 0, "Pie chart should be generated");
        
        // Test valid bar chart
        byte[] barBytes = chartService.generateBarChart("Test Bar", "X", "Y", java.util.List.of("A"), java.util.List.of(10), com.ecotrack.report.design.ReportTheme.EMERALD);
        assertTrue(barBytes.length > 0, "Bar chart should be generated");
    }

    @Test
    public void testPdfComponents() throws DocumentException {
        // Just verify it doesn't throw exceptions when building basic components
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        ReportMetadata metadata = ReportMetadata.builder()
                .title("Test Report")
                .periodStart("Start")
                .periodEnd("End")
                .generatedAt(LocalDateTime.now())
                .build();

        assertDoesNotThrow(() -> {
            ReportPdfComponents.addReportHeader(document, metadata, com.ecotrack.report.design.ReportTheme.EMERALD);
            ReportPdfComponents.addSectionHeader(document, "TEST SECTION", com.ecotrack.report.design.ReportTheme.EMERALD);
            
            PdfPTable kpiCard = ReportPdfComponents.createKpiCard("Test KPI", "123", com.ecotrack.report.design.ReportTheme.EMERALD);
            document.add(kpiCard);
            
            PdfPTable table = ReportPdfComponents.createStyledTable(2, new String[]{"Col 1", "Col 2"}, com.ecotrack.report.design.ReportTheme.EMERALD);
            ReportPdfComponents.addStyledTableCell(table, "Val 1", false, com.ecotrack.report.design.ReportTheme.EMERALD);
            ReportPdfComponents.addStyledTableCell(table, "Val 2", true, com.ecotrack.report.design.ReportTheme.EMERALD);
            document.add(table);
            
            ReportPdfComponents.addReportFooter(document, null, com.ecotrack.report.design.ReportTheme.EMERALD);
        });

        document.close();
        assertTrue(out.toByteArray().length > 0);
    }
}
