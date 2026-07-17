package com.ecotrack.user.exception;

public class UserProfileNotFoundException extends RuntimeException {

    public UserProfileNotFoundException() {
        super("User profile not found.");
    }

    public UserProfileNotFoundException(String message) {
        super(message);
    }
}
