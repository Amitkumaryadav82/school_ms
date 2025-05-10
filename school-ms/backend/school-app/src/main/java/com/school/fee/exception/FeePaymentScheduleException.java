package com.school.fee.exception;

public class FeePaymentScheduleException extends RuntimeException {

    public FeePaymentScheduleException(String message) {
        super(message);
    }

    public FeePaymentScheduleException(String message, Throwable cause) {
        super(message, cause);
    }
}