package com.ecotrack.tracking.exception;

public class EntryModificationNotAllowedException extends CarbonTrackingException {
    public EntryModificationNotAllowedException() {
        super("Historical entries cannot be modified.");
    }
    
    public EntryModificationNotAllowedException(String message) {
        super(message);
    }
}
