package com.ecotrack.common.exception;

import com.ecotrack.tracking.exception.CarbonEntryNotFoundException;
import com.ecotrack.tracking.exception.CarbonTrackingException;
import com.ecotrack.tracking.exception.EmissionFactorNotFoundException;
import com.ecotrack.tracking.exception.EntryModificationNotAllowedException;
import com.ecotrack.tracking.exception.InvalidCarbonCategoryException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles validation errors (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Validation failed");
        
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        response.put("errors", errors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Handles empty or unreadable JSON body
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Malformed or empty JSON request");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Handles duplicate emails or other business logic arguments
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Validation failed");
        
        Map<String, String> errors = new HashMap<>();
        errors.put("error", ex.getMessage());
        response.put("errors", errors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Handles invalid credentials
    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(org.springframework.security.authentication.BadCredentialsException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // Handles suspended accounts
    @ExceptionHandler(org.springframework.security.authentication.DisabledException.class)
    public ResponseEntity<Map<String, Object>> handleDisabledException(org.springframework.security.authentication.DisabledException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    // --- Carbon Tracking Exceptions ---

    @ExceptionHandler(CarbonEntryNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleCarbonEntryNotFoundException(CarbonEntryNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(InvalidCarbonCategoryException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCarbonCategoryException(InvalidCarbonCategoryException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(EmissionFactorNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEmissionFactorNotFoundException(EmissionFactorNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(EntryModificationNotAllowedException.class)
    public ResponseEntity<Map<String, Object>> handleEntryModificationNotAllowedException(EntryModificationNotAllowedException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    // Fallback for any other CarbonTrackingException
    @ExceptionHandler(CarbonTrackingException.class)
    public ResponseEntity<Map<String, Object>> handleCarbonTrackingException(CarbonTrackingException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
