package com.ecotrack.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class XpTransactionDTO {
    private Long id;
    private int amount;
    private String source;
    private String description;
    private String timestamp;
}
