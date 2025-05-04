package com.school.admission.exception;

import com.school.exception.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AdmissionExceptionHandler {

    @ExceptionHandler(AdmissionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAdmissionNotFoundException(AdmissionNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Admission Not Found",
                ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InvalidAdmissionStateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidAdmissionStateException(InvalidAdmissionStateException ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid Admission State",
                ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}