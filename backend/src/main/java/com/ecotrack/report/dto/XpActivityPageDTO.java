package com.ecotrack.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class XpActivityPageDTO {
    private String startDate;
    private String endDate;
    private long periodXpEarned;
    
    private List<XpTransactionDTO> transactions;
    
    // Pagination Metadata
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean hasNext;
}
