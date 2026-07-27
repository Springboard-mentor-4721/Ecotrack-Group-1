package com.ecotrack.challenge.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class ChallengeClosedException extends RuntimeException {
    public ChallengeClosedException(String message) {
        super(message);
    }
}
