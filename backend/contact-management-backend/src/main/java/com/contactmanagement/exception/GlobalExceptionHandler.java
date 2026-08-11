package com.contactmanagement.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        Map<String, Object> errors = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();
        StringBuilder objectErrors = new StringBuilder();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            if (error instanceof FieldError) {
                String fieldName = ((FieldError) error).getField();
                String errorMessage = error.getDefaultMessage();

                // Merge multiple messages for the same field
                if (fieldErrors.containsKey(fieldName)) {
                    fieldErrors.put(fieldName, fieldErrors.get(fieldName) + ", " + errorMessage);
                } else {
                    fieldErrors.put(fieldName, errorMessage);
                }
            } else {
                // Object level error (like cross-field validation)
                if (objectErrors.length() > 0) {
                    objectErrors.append(", ");
                }
                objectErrors.append(error.getDefaultMessage());
            }
        });

        if (!fieldErrors.isEmpty()) {
            errors.put("fieldErrors", fieldErrors);
        }
        if (objectErrors.length() > 0) {
            errors.put("errors", objectErrors.toString());
        }

        log.warn("Validation failed: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateResource(
            DuplicateResourceException ex) {

        log.warn("Duplicate resource: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(
            IllegalArgumentException ex) {

        log.warn("Bad request: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred: {}", ex.getMessage(), ex);
        Map<String, String> error = new HashMap<>();
        error.put("error", "An unexpected error occurred. Please try again.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(
            InvalidCredentialsException ex) {
        log.warn("Invalid credentials: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUsernameNotFound(
            UsernameNotFoundException ex) {
        log.warn("User not found: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "User not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {

        String message = ex.getMessage();
        Map<String, String> error = new HashMap<>();

        // Check if it's a unique constraint violation
        if (message != null && message.contains("Duplicate entry") ||
                message != null && message.contains("unique")) {
            log.warn("Duplicate entry violation: {}", ex.getMessage());
            error.put("error", "Email or phone already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        // Unknown data integrity issue - let it go to generic handler
        log.error("Unexpected data integrity violation: {}", ex.getMessage(), ex);
        throw ex; // Re-throw for generic handler
    }

    @ExceptionHandler(ContactNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleContactNotFound(
            ContactNotFoundException ex) {
        log.warn("Contact not found: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(PropertyReferenceException.class)
    public ResponseEntity<Map<String, String>> handlePropertyReferenceException(
            PropertyReferenceException ex) {
        log.warn("Invalid sort property: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid sort parameter. Please use: firstName, lastName, title, createdAt");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}