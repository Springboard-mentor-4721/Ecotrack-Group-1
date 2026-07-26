package com.ecotrack.tracking.exception;

public class InvalidCarbonCategoryException extends CarbonTrackingException {
    public InvalidCarbonCategoryException() {
        super("Invalid carbon category.");
    }
    
    public InvalidCarbonCategoryException(String message) {
        super(message);
    }
}
