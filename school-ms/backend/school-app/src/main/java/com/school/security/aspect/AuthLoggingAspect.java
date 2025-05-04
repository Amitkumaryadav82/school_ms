package com.school.security.aspect;

import com.school.security.dto.RegisterRequest;
import com.school.security.dto.AuthResponse;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class AuthLoggingAspect {

    @Before("execution(* com.school.security.AuthController.register(..))")
    public void logBeforeRegistration(JoinPoint joinPoint) {
        RegisterRequest request = (RegisterRequest) joinPoint.getArgs()[0];
        log.info("Registration attempt - Username: {}, Full Name: {}, Email: {}, Role: {}",
                request.getUsername(),
                request.getFullName(),
                request.getEmail(),
                request.getRole());
    }

    @AfterReturning(pointcut = "execution(* com.school.security.AuthController.register(..))", returning = "result")
    public void logAfterRegistration(JoinPoint joinPoint, Object result) {
        if (result instanceof AuthResponse) {
            AuthResponse response = (AuthResponse) result;
            log.info("Registration successful - Username: {}, Role: {}",
                    response.getUsername(),
                    response.getRole());
        }
    }

    @AfterThrowing(pointcut = "execution(* com.school.security.AuthController.register(..))", throwing = "error")
    public void logRegistrationError(JoinPoint joinPoint, Throwable error) {
        RegisterRequest request = (RegisterRequest) joinPoint.getArgs()[0];
        log.error("Registration failed for username: {} - Error: {}",
                request.getUsername(),
                error.getMessage());
    }

    @Before("execution(* com.school.security.AuthController.login(..))")
    public void logBeforeLogin(JoinPoint joinPoint) {
        log.info("Login attempt - Username: {}", joinPoint.getArgs()[0]);
    }

    @AfterReturning(pointcut = "execution(* com.school.security.AuthController.login(..))", returning = "result")
    public void logAfterLogin(JoinPoint joinPoint, Object result) {
        if (result instanceof AuthResponse) {
            AuthResponse response = (AuthResponse) result;
            log.info("Login successful - Username: {}, Role: {}",
                    response.getUsername(),
                    response.getRole());
        }
    }

    @AfterThrowing(pointcut = "execution(* com.school.security.AuthController.login(..))", throwing = "error")
    public void logLoginError(JoinPoint joinPoint, Throwable error) {
        log.error("Login failed - Error: {}", error.getMessage());
    }
}