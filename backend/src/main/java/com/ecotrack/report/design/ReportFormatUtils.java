package com.ecotrack.report.design;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ReportFormatUtils {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("d MMM yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("d MMM yyyy, h:mm a");
    private static final DecimalFormat NUMBER_FORMAT = new DecimalFormat("#,##0");
    private static final DecimalFormat DECIMAL_FORMAT = new DecimalFormat("#,##0.00");
    private static final DecimalFormat PERCENTAGE_FORMAT = new DecimalFormat("#,##0.0'%'");

    public static String formatDate(LocalDate date) {
        if (date == null) return "N/A";
        return date.format(DATE_FORMATTER);
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "N/A";
        return dateTime.format(DATETIME_FORMATTER);
    }

    public static String formatStringDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty() || dateStr.equals("N/A")) return "N/A";
        try {
            if (dateStr.length() > 10) { // e.g., "2026-08-07 10:00"
                if (dateStr.contains("T")) {
                    return formatDateTime(LocalDateTime.parse(dateStr));
                } else {
                    DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
                    return formatDateTime(LocalDateTime.parse(dateStr, fmt));
                }
            } else {
                return formatDate(LocalDate.parse(dateStr));
            }
        } catch (Exception e) {
            return dateStr;
        }
    }

    public static String formatDateRange(LocalDate start, LocalDate end) {
        String s = start != null ? formatDate(start) : "All Time";
        String e = end != null ? formatDate(end) : "Now";
        return s + " \u2013 " + e;
    }

    public static String formatCarbon(BigDecimal value) {
        if (value == null) return "0 kg CO₂e";
        return DECIMAL_FORMAT.format(value.setScale(2, RoundingMode.HALF_UP)) + " kg CO₂e";
    }

    public static String formatPercentage(BigDecimal value) {
        if (value == null) return "0.0%";
        return PERCENTAGE_FORMAT.format(value.setScale(1, RoundingMode.HALF_UP));
    }

    public static String toHumanReadable(String enumName) {
        if (enumName == null || enumName.isEmpty()) return "N/A";
        
        // Semantic overrides
        if ("PLANT_TREES".equals(enumName)) return "Plant Trees";
        if ("COMPLETED".equals(enumName)) return "Completed";
        if ("WITHIN_BUDGET".equals(enumName)) return "Within Budget";
        if ("BUDGET_EXCEEDED".equals(enumName)) return "Budget Exceeded";
        if ("IN_PROGRESS".equals(enumName)) return "In Progress";
        if ("EXCEEDED".equals(enumName)) return "Exceeded";

        // Generic humanizer
        String[] words = enumName.replace('_', ' ').split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (word.isEmpty()) continue;
            sb.append(Character.toUpperCase(word.charAt(0)));
            if (word.length() > 1) {
                sb.append(word.substring(1).toLowerCase());
            }
            sb.append(" ");
        }
        return sb.toString().trim();
    }
    
    public static String formatPercentage(Double value) {
        if (value == null) return "0.0%";
        return PERCENTAGE_FORMAT.format(value);
    }

    public static String formatCount(Long count) {
        if (count == null) return "0";
        return NUMBER_FORMAT.format(count);
    }

    public static String formatCount(Integer count) {
        if (count == null) return "0";
        return NUMBER_FORMAT.format(count);
    }
}
