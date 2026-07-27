package com.ecotrack.recommendation.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
public class RecommendationCooldownException extends RuntimeException {
    public RecommendationCooldownException(String message) {
        super(message);
    }
}
