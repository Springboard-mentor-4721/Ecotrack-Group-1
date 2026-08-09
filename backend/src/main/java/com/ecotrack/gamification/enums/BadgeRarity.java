package com.ecotrack.gamification.enums;

public enum BadgeRarity {
    COMMON(100),
    RARE(250),
    EPIC(500),
    LEGENDARY(1000);

    private final int xpReward;

    BadgeRarity(int xpReward) {
        this.xpReward = xpReward;
    }

    public int getXpReward() {
        return xpReward;
    }

    public static BadgeRarity fromString(String rarity) {
        if (rarity == null) return COMMON;
        try {
            return BadgeRarity.valueOf(rarity.toUpperCase());
        } catch (IllegalArgumentException e) {
            return COMMON;
        }
    }
}
