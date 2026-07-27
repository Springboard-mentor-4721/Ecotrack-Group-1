package com.ecotrack.challenge.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ChallengeAlreadyJoinedException extends RuntimeException {
    public ChallengeAlreadyJoinedException(String message) {
        super(message);
    }
}
