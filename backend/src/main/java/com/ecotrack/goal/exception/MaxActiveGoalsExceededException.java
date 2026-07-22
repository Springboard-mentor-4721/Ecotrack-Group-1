package com.ecotrack.goal.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class MaxActiveGoalsExceededException extends RuntimeException {
    public MaxActiveGoalsExceededException(String message) {
        super(message);
    }
}
