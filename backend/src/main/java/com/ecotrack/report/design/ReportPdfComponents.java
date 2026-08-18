package com.ecotrack.report.design;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

public class ReportPdfComponents {

    public static void addReportHeader(Document document, ReportMetadata metadata, ReportTheme theme) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{3f, 1f});

        PdfPCell titleCell = new PdfPCell(new Phrase(metadata.getTitle(), ReportDesignConstants.getFontTitle(theme)));
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setPaddingBottom(5f);
        headerTable.addCell(titleCell);

        PdfPCell logoCell = new PdfPCell(new Phrase("EcoTrack", ReportDesignConstants.getFontSectionHeading(theme)));
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        headerTable.addCell(logoCell);

        if (metadata.getSubtitle() != null) {
            PdfPCell subtitleCell = new PdfPCell(new Phrase(metadata.getSubtitle(), ReportDesignConstants.getFontSubtitle(theme)));
            subtitleCell.setBorder(Rectangle.NO_BORDER);
            subtitleCell.setColspan(2);
            subtitleCell.setPaddingBottom(5f);
            headerTable.addCell(subtitleCell);
        }

        if (metadata.getUserName() != null) {
            PdfPCell userCell = new PdfPCell(new Phrase("Prepared for: " + metadata.getUserName() + 
                (metadata.getUserEmail() != null ? " (" + metadata.getUserEmail() + ")" : ""), ReportDesignConstants.getFontBody(theme)));
            userCell.setBorder(Rectangle.NO_BORDER);
            userCell.setColspan(2);
            userCell.setPaddingTop(10f);
            userCell.setPaddingBottom(5f);
            headerTable.addCell(userCell);
        }

        if (metadata.getPeriodStart() != null) {
            String pStart = metadata.getPeriodStart();
            String pEnd = metadata.getPeriodEnd();
            String periodText = "Reporting Period: " + pStart + " to " + pEnd;
            PdfPCell periodCell = new PdfPCell(new Phrase(periodText, ReportDesignConstants.getFontBody(theme)));
            periodCell.setBorder(Rectangle.NO_BORDER);
            periodCell.setColspan(2);
            headerTable.addCell(periodCell);
        }

        String generatedText = "Generated: " + com.ecotrack.report.design.ReportFormatUtils.formatDate(java.time.LocalDate.now());
        PdfPCell generatedCell = new PdfPCell(new Phrase(generatedText, ReportDesignConstants.getFontFootnote(theme)));
        generatedCell.setBorder(Rectangle.NO_BORDER);
        generatedCell.setColspan(2);
        generatedCell.setPaddingTop(5f);
        generatedCell.setPaddingBottom(20f);
        headerTable.addCell(generatedCell);

        document.add(headerTable);
    }

    public static void addSectionHeader(Document document, String title, ReportTheme theme) throws DocumentException {
        Paragraph p = new Paragraph(title, ReportDesignConstants.getFontSectionHeading(theme));
        p.setSpacingBefore(20f);
        p.setSpacingAfter(10f);
        document.add(p);
    }

    public static PdfPTable createKpiCard(String label, String value, ReportTheme theme) {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();
        cell.setBorderColor(theme.getBorderColor());
        cell.setBorderWidth(1f);
        cell.setPadding(12f);
        cell.setBorderColorLeft(theme.getPrimaryColor());
        cell.setBorderWidthLeft(4f);
        cell.setBackgroundColor(theme.getCardBackground());
        cell.setPaddingBottom(16f);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph labelP = new Paragraph(label, ReportDesignConstants.getFontKpiLabel(theme));
        labelP.setAlignment(Element.ALIGN_CENTER);
        
        Paragraph valueP = new Paragraph(value, ReportDesignConstants.getFontKpiValue(theme));
        valueP.setAlignment(Element.ALIGN_CENTER);
        valueP.setSpacingBefore(4f);

        cell.addElement(labelP);
        cell.addElement(valueP);
        
        table.addCell(cell);
        
        return table;
    }

    public static PdfPTable createStyledTable(int numColumns, String[] headers, ReportTheme theme) throws DocumentException {
        PdfPTable table = new PdfPTable(numColumns);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        table.setSpacingAfter(20f);
        table.setHeaderRows(1);

        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, ReportDesignConstants.getFontTableHeader(theme)));
            cell.setBackgroundColor(theme.getTableHeaderColor());
            cell.setBorderColor(theme.getBorderColor());
            cell.setPadding(8f);
            table.addCell(cell);
        }

        return table;
    }

    public static void addStyledTableCell(PdfPTable table, String text, boolean isEvenRow, ReportTheme theme) {
        addStyledTableCell(table, text, isEvenRow, Element.ALIGN_LEFT, theme);
    }

    public static void addStyledTableCell(PdfPTable table, String text, boolean isEvenRow, int alignment, ReportTheme theme) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", ReportDesignConstants.getFontTableBody(theme)));
        cell.setBorderColor(theme.getBorderColor());
        cell.setPadding(8f);
        table.addCell(cell);
    }

    public static void addReportFooter(Document document, PdfWriter writer, ReportTheme theme) throws DocumentException {
        Paragraph footer = new Paragraph("EcoTrack Sustainability Platform", ReportDesignConstants.getFontFootnote(theme));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }
}
