package com.school.hrm.exception;

public class LeaveNotFoundException extends RuntimeException {
    public LeaveNotFoundException(String message) {
        super(message);
    }

    public LeaveNotFoundException(Long id) {
        super("Leave request not found with id: " + id);
    }
}