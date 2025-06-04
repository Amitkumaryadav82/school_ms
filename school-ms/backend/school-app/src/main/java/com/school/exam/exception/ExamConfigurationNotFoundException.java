package com.school.exam.exception;

public class ExamConfigurationNotFoundException extends RuntimeException {
    public ExamConfigurationNotFoundException(String message) {
        super(message);
    }
}
