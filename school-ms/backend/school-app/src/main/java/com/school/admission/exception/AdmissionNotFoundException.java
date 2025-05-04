package com.school.admission.exception;

public class AdmissionNotFoundException extends RuntimeException {
    public AdmissionNotFoundException(String message) {
        super(message);
    }
}