package com.ecotrack.report.design;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReportMetadata {
    private String title;
    private String reportType;
    private String subtitle;
    private String audience;
    private String periodStart;
    private String periodEnd;
    private String userName;
    private String userEmail;
    
    @Builder.Default
    private LocalDateTime generatedAt = LocalDateTime.now();
}
