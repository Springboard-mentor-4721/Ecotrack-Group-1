package com.ecotrack.report.service;

import com.ecotrack.report.dto.CarbonReportDTO;
import com.ecotrack.report.dto.ChallengeReportDTO;
import com.ecotrack.report.dto.GoalReportDTO;
import com.ecotrack.report.dto.SustainabilityReportDTO;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class PdfExportService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public byte[] exportCarbonReport(CarbonReportDTO report) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, "EcoTrack Carbon Footprint Report", report.getStartDate(), report.getEndDate());

            document.add(new Paragraph("Total Emissions: " + report.getTotalEmissions() + " kg CO2e"));
            document.add(new Paragraph(" "));

            if (report.getEmissionsByCategory() != null && !report.getEmissionsByCategory().isEmpty()) {
                PdfPTable table = new PdfPTable(2);
                table.setWidthPercentage(100);
                addTableHeader(table, "Category", "Emissions (kg CO2e)");

                for (Map.Entry<String, java.math.BigDecimal> entry : report.getEmissionsByCategory().entrySet()) {
                    table.addCell(entry.getKey());
                    table.addCell(entry.getValue().toString());
                }
                document.add(table);
                document.add(new Paragraph(" "));
            }

            if (report.getEntries() != null && !report.getEntries().isEmpty()) {
                PdfPTable table = new PdfPTable(4);
                table.setWidthPercentage(100);
                addTableHeader(table, "Date", "Category", "Subcategory", "Emission");

                for (CarbonReportDTO.CarbonEntryDetail detail : report.getEntries()) {
                    table.addCell(detail.getDate());
                    table.addCell(detail.getCategory());
                    table.addCell(detail.getSubCategory());
                    table.addCell(detail.getEmission().toString());
                }
                document.add(table);
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public byte[] exportGoalReport(GoalReportDTO report) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, "EcoTrack Goal Achievement Report", report.getStartDate(), report.getEndDate());

            document.add(new Paragraph("Total Goals: " + report.getTotalGoals()));
            document.add(new Paragraph("Active Goals: " + report.getActiveGoals()));
            document.add(new Paragraph("Completed Goals: " + report.getCompletedGoals()));
            document.add(new Paragraph("Failed/Abandoned Goals: " + report.getFailedGoals()));
            document.add(new Paragraph(" "));

            if (report.getGoals() != null && !report.getGoals().isEmpty()) {
                PdfPTable table = new PdfPTable(5);
                table.setWidthPercentage(100);
                addTableHeader(table, "Title", "Type", "Status", "Progress", "Target Date");

                for (GoalReportDTO.GoalDetail detail : report.getGoals()) {
                    table.addCell(detail.getTitle());
                    table.addCell(detail.getType());
                    table.addCell(detail.getStatus());
                    table.addCell(detail.getProgressPercentage() + "%");
                    table.addCell(detail.getTargetDate());
                }
                document.add(table);
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public byte[] exportChallengeReport(ChallengeReportDTO report) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, "EcoTrack Challenge Participation Report", report.getStartDate(), report.getEndDate());

            document.add(new Paragraph("Total Participated: " + report.getTotalParticipated()));
            document.add(new Paragraph("Completed Challenges: " + report.getCompletedChallenges()));
            document.add(new Paragraph("Total XP Earned: " + report.getTotalXpEarned()));
            document.add(new Paragraph(" "));

            if (report.getChallenges() != null && !report.getChallenges().isEmpty()) {
                PdfPTable table = new PdfPTable(4);
                table.setWidthPercentage(100);
                addTableHeader(table, "Title", "Category", "Status", "XP Earned");

                for (ChallengeReportDTO.ChallengeDetail detail : report.getChallenges()) {
                    table.addCell(detail.getTitle());
                    table.addCell(detail.getCategory());
                    table.addCell(detail.getStatus());
                    table.addCell(String.valueOf(detail.getXpEarned()));
                }
                document.add(table);
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public byte[] exportSustainabilityReport(SustainabilityReportDTO report) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, "EcoTrack Sustainability Report", report.getStartDate(), report.getEndDate());

            document.add(new Paragraph("Carbon Footprint Summary", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            document.add(new Paragraph("Total Emissions: " + report.getTotalEmissions() + " kg CO2e"));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Goals Summary", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            document.add(new Paragraph("Total Goals: " + report.getTotalGoals()));
            document.add(new Paragraph("Completed Goals: " + report.getCompletedGoals()));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Challenges Summary", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            document.add(new Paragraph("Completed Challenges: " + report.getCompletedChallenges()));
            document.add(new Paragraph("Total XP Earned: " + report.getXpEarned()));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("EcoScore Status", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            document.add(new Paragraph("Current EcoScore: " + report.getCurrentEcoScore()));
            document.add(new Paragraph("Current Rank: " + report.getCurrentRank()));
            document.add(new Paragraph(" "));
            
            if (report.getXpTransactions() != null && !report.getXpTransactions().isEmpty()) {
                document.add(new Paragraph("XP Activity", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
                document.add(new Paragraph(" "));
                
                PdfPTable table = new PdfPTable(3);
                table.setWidthPercentage(100);
                addTableHeader(table, "Date", "Activity", "XP Amount");

                for (com.ecotrack.report.dto.XpTransactionDTO tx : report.getXpTransactions()) {
                    table.addCell(tx.getTimestamp());
                    table.addCell(tx.getDescription());
                    table.addCell((tx.getAmount() > 0 ? "+" : "") + tx.getAmount());
                }
                document.add(table);
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private void addHeader(Document document, String titleStr, String startDate, String endDate) throws Exception {
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph(titleStr, titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        
        Paragraph subtitle = new Paragraph("Period: " + startDate + " to " + endDate);
        subtitle.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(subtitle);
        
        Paragraph generated = new Paragraph("Generated: " + LocalDateTime.now().format(FORMATTER));
        generated.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(generated);
        
        document.add(new Paragraph(" "));
        document.add(new Paragraph(" "));
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            table.addCell(cell);
        }
    }
}
