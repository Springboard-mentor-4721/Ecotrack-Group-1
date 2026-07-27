package com.ecotrack.gamification.dto;

import com.ecotrack.gamification.enums.XpSourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class XpLedgerEntryDTO {
    private Long id;
    private Long userId;
    private Integer xpAwarded;
    private XpSourceType sourceType;
    private Long sourceId;
    private LocalDateTime awardedAt;
}
