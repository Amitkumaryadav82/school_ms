package com.school.attendance.exception;

public class AttendanceValidationException extends RuntimeException {
    public AttendanceValidationException(String message) {
        super(message);
    }
}