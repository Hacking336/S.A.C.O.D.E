package com.mabini.sacode.service;

/**
 * Raised when the vision model could not be reached or answered something the
 * API cannot use. Mapped to HTTP 502 by {@code ApiExceptionHandler} so the
 * browser can show a real reason instead of a generic 500.
 */
public class TriageUnavailableException extends RuntimeException {

    public TriageUnavailableException(String message) {
        super(message);
    }
}
