package com.school.admission.exception;

public class InvalidAdmissionStateException extends RuntimeException {
    public InvalidAdmissionStateException(String message) {
        super(message);
    }
}