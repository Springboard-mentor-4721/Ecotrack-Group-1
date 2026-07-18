package com.ecotrack.goal.exception;

public class MaxActiveGoalsReachedException extends RuntimeException {
    public MaxActiveGoalsReachedException(String message) {
        super(message);
    }
}
