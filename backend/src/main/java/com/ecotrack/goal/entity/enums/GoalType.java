package com.ecotrack.goal.entity.enums;

public enum GoalType {
    REDUCE_CARBON_EMISSIONS("Reduce Carbon Emissions", true),
    REDUCE_WATER_USAGE("Reduce Water Usage", true),
    REDUCE_ELECTRICITY_CONSUMPTION("Reduce Electricity Consumption", true),
    USE_PUBLIC_TRANSPORT("Use Public Transport", true),
    INCREASE_RECYCLING("Increase Recycling", true),
    REDUCE_PLASTIC_USAGE("Reduce Plastic Usage", true),
    PLANT_TREES("Plant Trees", false);

    private final String displayName;
    private final boolean automatic;

    GoalType(String displayName, boolean automatic) {
        this.displayName = displayName;
        this.automatic = automatic;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isAutomatic() {
        return automatic;
    }
}
