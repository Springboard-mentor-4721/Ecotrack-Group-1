package com.ecotrack.ai.exception;

public class AiValidationException extends AiServiceException {
    public AiValidationException(String message, Throwable cause) {
        super(message, cause);
    }
    public AiValidationException(String message) {
        super(message);
    }
}
