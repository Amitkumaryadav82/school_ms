package com.school.attendance.aspect;

import com.school.attendance.model.Attendance;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Arrays;

@Aspect
@Component
@Slf4j
public class AttendanceLoggingAspect {

    @Before("execution(* com.school.attendance.service.AttendanceService.*(..))")
    public void logBeforeAttendanceOperation(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        String args = Arrays.toString(joinPoint.getArgs());
        log.debug("Executing attendance operation: {} with arguments: {} at {}",
                methodName, args, LocalDateTime.now());
    }

    @AfterReturning(pointcut = "execution(* com.school.attendance.service.AttendanceService.markAttendance(..))", returning = "result")
    public void logAfterAttendanceMarked(JoinPoint joinPoint, Attendance result) {
        log.info("Attendance marked for student ID: {} with status: {} for date: {}",
                result.getStudent().getId(),
                result.getStatus(),
                result.getDate());
    }

    @AfterReturning(pointcut = "execution(* com.school.attendance.service.AttendanceService.generateAttendanceAlerts())", returning = "result")
    public void logAfterAlertGeneration(JoinPoint joinPoint, Object result) {
        log.info("Attendance alerts generation completed at {}", LocalDateTime.now());
    }

    @AfterReturning(pointcut = "execution(* com.school.attendance.service.AttendanceService.deleteAttendanceOlderThan(..))", returning = "result")
    public void logAfterCleanup(JoinPoint joinPoint, Integer result) {
        log.info("Cleaned up {} old attendance records at {}", result, LocalDateTime.now());
    }

    @AfterThrowing(pointcut = "execution(* com.school.attendance.service.*.*(..))", throwing = "error")
    public void logAttendanceError(JoinPoint joinPoint, Throwable error) {
        String methodName = joinPoint.getSignature().getName();
        log.error("Error in attendance operation: {} - Error: {}", methodName, error.getMessage());
    }
}