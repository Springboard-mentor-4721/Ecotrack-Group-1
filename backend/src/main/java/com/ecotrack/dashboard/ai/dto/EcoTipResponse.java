package com.ecotrack.dashboard.ai.dto;

public record EcoTipResponse(
        String tipText,
        String relatedCategory   // nullable
) {}
