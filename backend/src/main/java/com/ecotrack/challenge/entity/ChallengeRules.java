package com.ecotrack.challenge.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeRules {
    private List<Long> allowedSubcategories;
    private List<Long> blockedSubcategories;
    
    private Boolean approvalRequired;
    private String submissionType;
    private Boolean evidenceRequired;
    private String unit;
}
