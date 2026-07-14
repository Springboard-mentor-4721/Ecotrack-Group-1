package com.ecotrack.tracking.exception;

public class CarbonEntryNotFoundException extends CarbonTrackingException {
    public CarbonEntryNotFoundException() {
        super("Carbon entry not found.");
    }
    
    public CarbonEntryNotFoundException(String message) {
        super(message);
    }
}
