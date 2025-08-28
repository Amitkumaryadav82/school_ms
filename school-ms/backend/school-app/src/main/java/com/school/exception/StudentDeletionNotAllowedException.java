package com.school.exception;

/**
 * Thrown when attempting to delete a student who has related records
 * (e.g., payment history) that must be handled first.
 */
public class StudentDeletionNotAllowedException extends RuntimeException {
    public StudentDeletionNotAllowedException(String message) {
        super(message);
    }
}
