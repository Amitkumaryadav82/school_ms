package com.school.exam.exception;

public class QuestionPaperNotFoundException extends RuntimeException {
    public QuestionPaperNotFoundException(String message) {
        super(message);
    }
}
