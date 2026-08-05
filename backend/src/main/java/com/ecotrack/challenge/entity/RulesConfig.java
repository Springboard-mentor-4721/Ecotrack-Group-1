package com.ecotrack.challenge.entity;

import java.util.List;

public record RulesConfig(
    List<Long> allowedSubcategoryIds,
    List<Long> blockedSubcategoryIds
) {}
