package com.ecotrack.tracking.exception;

public class EmissionFactorNotFoundException extends CarbonTrackingException {
    public EmissionFactorNotFoundException() {
        super("Emission factor not available for the selected category and date.");
    }

    public EmissionFactorNotFoundException(String message) {
        super(message);
    }
}
