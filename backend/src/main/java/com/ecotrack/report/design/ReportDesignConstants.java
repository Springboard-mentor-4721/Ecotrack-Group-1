package com.ecotrack.report.design;

import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;

import java.awt.Color;

public class ReportDesignConstants {

    // Palette
    public static final Color COLOR_PRIMARY = Color.decode("#10B981"); // Emerald
    public static final Color COLOR_DARK_SLATE = Color.decode("#0F172A");
    public static final Color COLOR_SLATE = Color.decode("#64748B");
    public static final Color COLOR_LIGHT_BG = Color.decode("#F8FAFC");
    public static final Color COLOR_BORDER = Color.decode("#E2E8F0");
    public static final Color COLOR_SUCCESS = Color.decode("#22C55E");
    public static final Color COLOR_WARNING = Color.decode("#F59E0B");
    public static final Color COLOR_DANGER = Color.decode("#EF4444");
    
    private static com.lowagie.text.pdf.BaseFont robotoRegular;
    private static com.lowagie.text.pdf.BaseFont robotoBold;

    static {
        try {
            byte[] regularBytes = ReportDesignConstants.class.getResourceAsStream("/fonts/Roboto-Regular.ttf").readAllBytes();
            robotoRegular = com.lowagie.text.pdf.BaseFont.createFont("Roboto-Regular.ttf", com.lowagie.text.pdf.BaseFont.IDENTITY_H, com.lowagie.text.pdf.BaseFont.EMBEDDED, true, regularBytes, null);
            byte[] boldBytes = ReportDesignConstants.class.getResourceAsStream("/fonts/Roboto-Bold.ttf").readAllBytes();
            robotoBold = com.lowagie.text.pdf.BaseFont.createFont("Roboto-Bold.ttf", com.lowagie.text.pdf.BaseFont.IDENTITY_H, com.lowagie.text.pdf.BaseFont.EMBEDDED, true, boldBytes, null);
        } catch (Exception e) {
            System.err.println("Failed to load Roboto fonts: " + e.getMessage());
        }
    }

    private static Font getRegularFont(int size, Color color) {
        if (robotoRegular != null) return new Font(robotoRegular, size, Font.NORMAL, color);
        return FontFactory.getFont(FontFactory.HELVETICA, size, color);
    }

    private static Font getBoldFont(int size, Color color) {
        if (robotoBold != null) return new Font(robotoBold, size, Font.NORMAL, color);
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, size, color);
    }

    public static Font getFontTitle(ReportTheme theme) { return getBoldFont(22, theme.getTextColor()); }
    public static Font getFontSubtitle(ReportTheme theme) { return getRegularFont(14, theme.getMutedTextColor()); }
    public static Font getFontSectionHeading(ReportTheme theme) { return getBoldFont(16, theme.getPrimaryColor()); }
    public static Font getFontSubsectionHeading(ReportTheme theme) { return getBoldFont(12, theme.getTextColor()); }
    public static Font getFontKpiValue(ReportTheme theme) { return getBoldFont(18, theme.getTextColor()); }
    public static Font getFontKpiLabel(ReportTheme theme) { return getRegularFont(10, theme.getMutedTextColor()); }
    public static Font getFontBody(ReportTheme theme) { return getRegularFont(11, theme.getTextColor()); }
    public static Font getFontTableHeader(ReportTheme theme) { return getBoldFont(10, theme.getTableHeaderTextColor()); }
    public static Font getFontTableBody(ReportTheme theme) { return getRegularFont(10, theme.getTextColor()); }
    public static Font getFontFootnote(ReportTheme theme) { return getRegularFont(8, theme.getMutedTextColor()); }
}
