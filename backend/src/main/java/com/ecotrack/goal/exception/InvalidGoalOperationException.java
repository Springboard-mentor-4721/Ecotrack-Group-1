package com.ecotrack.goal.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class InvalidGoalOperationException extends RuntimeException {
    public InvalidGoalOperationException(String message) {
        super(message);
    }
}
