package com.ecotrack.report.design;

import lombok.Builder;
import lombok.Getter;

import java.awt.Color;

@Getter
@Builder
public class ReportTheme {
    private String id;
    private String name;

    private Color primaryColor;
    private Color secondaryColor;
    private Color accentColor;
    private Color backgroundColor;
    private Color cardBackground;
    private Color textColor;
    private Color mutedTextColor;
    private Color borderColor;
    
    private Color successColor;
    private Color warningColor;
    private Color dangerColor;

    private Color tableHeaderColor;
    private Color tableHeaderTextColor;
    private Color zebraRowColor;
    
    private Color[] chartPalette;

    public static ReportTheme EMERALD = ReportTheme.builder()
            .id("emerald")
            .name("Eco Emerald")
            .primaryColor(Color.decode("#10B981"))
            .secondaryColor(Color.decode("#047857"))
            .accentColor(Color.decode("#34D399"))
            .backgroundColor(Color.decode("#F8FAFC"))
            .cardBackground(Color.decode("#FFFFFF"))
            .textColor(Color.decode("#0F172A"))
            .mutedTextColor(Color.decode("#64748B"))
            .borderColor(Color.decode("#E2E8F0"))
            .successColor(Color.decode("#22C55E"))
            .warningColor(Color.decode("#F59E0B"))
            .dangerColor(Color.decode("#EF4444"))
            .tableHeaderColor(Color.decode("#10B981"))
            .tableHeaderTextColor(Color.decode("#FFFFFF"))
            .zebraRowColor(Color.decode("#F8FAFC"))
            .chartPalette(new Color[]{
                Color.decode("#10B981"), Color.decode("#64748B"),
                Color.decode("#F59E0B"), Color.decode("#22C55E"),
                Color.decode("#EF4444"), Color.decode("#0F172A")
            })
            .build();

    public static ReportTheme SLATE = ReportTheme.builder()
            .id("slate")
            .name("Executive Slate")
            .primaryColor(Color.decode("#334155"))
            .secondaryColor(Color.decode("#1E293B"))
            .accentColor(Color.decode("#10B981"))
            .backgroundColor(Color.decode("#FFFFFF"))
            .cardBackground(Color.decode("#F8FAFC"))
            .textColor(Color.decode("#1E293B"))
            .mutedTextColor(Color.decode("#64748B"))
            .borderColor(Color.decode("#CBD5E1"))
            .successColor(Color.decode("#10B981")) // Emerald accent
            .warningColor(Color.decode("#F59E0B"))
            .dangerColor(Color.decode("#EF4444"))
            .tableHeaderColor(Color.decode("#334155"))
            .tableHeaderTextColor(Color.decode("#FFFFFF"))
            .zebraRowColor(Color.decode("#F1F5F9"))
            .chartPalette(new Color[]{
                Color.decode("#334155"), Color.decode("#10B981"),
                Color.decode("#64748B"), Color.decode("#94A3B8"),
                Color.decode("#475569"), Color.decode("#1E293B")
            })
            .build();

    public static ReportTheme MINIMAL = ReportTheme.builder()
            .id("minimal")
            .name("Minimal Light")
            .primaryColor(Color.decode("#64748B"))
            .secondaryColor(Color.decode("#000000"))
            .accentColor(Color.decode("#94A3B8"))
            .backgroundColor(Color.decode("#FFFFFF"))
            .cardBackground(Color.decode("#FFFFFF"))
            .textColor(Color.decode("#000000"))
            .mutedTextColor(Color.decode("#475569"))
            .borderColor(Color.decode("#E2E8F0"))
            .successColor(Color.decode("#64748B"))
            .warningColor(Color.decode("#475569"))
            .dangerColor(Color.decode("#000000"))
            .tableHeaderColor(Color.decode("#F8FAFC"))
            .tableHeaderTextColor(Color.decode("#000000"))
            .zebraRowColor(Color.decode("#FFFFFF"))
            .chartPalette(new Color[]{
                Color.decode("#000000"), Color.decode("#333333"),
                Color.decode("#666666"), Color.decode("#999999"),
                Color.decode("#CCCCCC"), Color.decode("#444444")
            })
            .build();

    public static ReportTheme fromId(String id) {
        if (id == null) return EMERALD;
        switch (id.toLowerCase()) {
            case "slate": return SLATE;
            case "minimal": return MINIMAL;
            case "emerald":
            default: return EMERALD;
        }
    }
}
