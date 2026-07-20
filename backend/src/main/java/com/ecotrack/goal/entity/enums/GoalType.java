package com.ecotrack.goal.entity.enums;

public enum GoalType {
    REDUCE_CARBON_EMISSIONS("Reduce Carbon Emissions"),
    REDUCE_ELECTRICITY_CONSUMPTION("Reduce Electricity Consumption"),
    REDUCE_WATER_USAGE("Reduce Water Usage"),
    INCREASE_RECYCLING("Increase Recycling"),
    REDUCE_PLASTIC_USAGE("Reduce Plastic Usage"),
    USE_PUBLIC_TRANSPORT("Use Public Transport"),
    PLANT_TREES("Plant Trees");

    private final String displayName;

    GoalType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
