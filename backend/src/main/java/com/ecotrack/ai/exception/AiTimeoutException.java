package com.ecotrack.ai.exception;

public class AiTimeoutException extends AiServiceException {
    public AiTimeoutException(String message, Throwable cause) {
        super(message, cause);
    }
    public AiTimeoutException(String message) {
        super(message);
    }
}
