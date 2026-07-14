package com.ecotrack.tracking.exception;

public class CarbonTrackingException extends RuntimeException {
    public CarbonTrackingException(String message) {
        super(message);
    }

    public CarbonTrackingException(String message, Throwable cause) {
        super(message, cause);
    }
}
