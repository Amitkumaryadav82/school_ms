package com.school.web;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.persistence.OptimisticLockException;
import java.util.HashMap;
import java.util.Map;

// Deprecated: This class is intentionally NOT annotated with @ControllerAdvice
// to avoid duplicate bean conflicts with com.school.exception.GlobalExceptionHandler.
// Keeping it as plain utility methods for reference; it will not be registered as a Spring bean.
public class GlobalExceptionHandler {

    private ResponseEntity<Map<String, Object>> body(HttpStatus status, String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("status", status.value());
        m.put("error", status.getReasonPhrase());
        m.put("message", message);
        return ResponseEntity.status(status).body(m);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getAllErrors().stream().findFirst()
                .map(e -> e.getDefaultMessage()).orElse("Validation failed");
        return body(HttpStatus.UNPROCESSABLE_ENTITY, msg);
    }

    @ExceptionHandler(OptimisticLockException.class)
    public ResponseEntity<Map<String, Object>> handleOptimistic(OptimisticLockException ex) {
        return body(HttpStatus.CONFLICT, "Concurrent update detected. Please retry.");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraint(DataIntegrityViolationException ex) {
        return body(HttpStatus.CONFLICT, "Data integrity violation. The requested change conflicts with existing data.");
    }

    @ExceptionHandler(CannotCreateTransactionException.class)
    public ResponseEntity<Map<String, Object>> handleDbDown(CannotCreateTransactionException ex) {
        return body(HttpStatus.SERVICE_UNAVAILABLE, "Database is temporarily unavailable. Please try again later.");
    }
}
