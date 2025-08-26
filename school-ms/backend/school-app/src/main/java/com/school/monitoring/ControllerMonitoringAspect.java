package com.school.monitoring;

import io.micrometer.core.instrument.Timer;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Method;

/**
 * Aspect that monitors the performance of REST controller methods.
 * Automatically tracks timing information for all controller endpoints.
 */
@Aspect
@Component
public class ControllerMonitoringAspect {

    private static final Logger logger = LoggerFactory.getLogger(ControllerMonitoringAspect.class);

    private final PerformanceMonitoringService monitoringService;

    public ControllerMonitoringAspect(PerformanceMonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    /**
     * Pointcut for all methods in classes annotated with @RestController
     */
    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
    public void restControllerClass() {
    }

    /**
     * Pointcut for all methods annotated with Spring MVC annotations
     */
    @Pointcut("@annotation(org.springframework.web.bind.annotation.GetMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.PutMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.DeleteMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.RequestMapping)")
    public void requestMappingMethod() {
    }

    /**
     * Combines the pointcuts to target only REST controller endpoint methods
     */
    @Pointcut("restControllerClass() && requestMappingMethod()")
    public void restEndpoint() {
    }

    /**
     * Advice that tracks timing for endpoint invocations
     */
    @Around("restEndpoint()")
    public Object monitorEndpointPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        // Get method information
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        String className = signature.getDeclaringType().getSimpleName();
        String methodName = method.getName();
        String endpointName = className + "." + methodName;

        // Determine HTTP method
        String httpMethod = determineHttpMethod(method);

        // Start timing
        Timer.Sample timerSample = monitoringService.startTimer();
    // traceId available via MDC if needed for future logging

        try {
            // Execute the method
            Object result = joinPoint.proceed();

            // Record successful invocation
            monitoringService.incrementCounter("api.invocation",
                    "endpoint", endpointName,
                    "method", httpMethod,
                    "status", "success");

            return result;
        } catch (Exception e) {
            // Record failed invocation
            monitoringService.incrementCounter("api.invocation",
                    "endpoint", endpointName,
                    "method", httpMethod,
                    "status", "error",
                    "exception", e.getClass().getSimpleName());

            // Downgrade to WARN for common client-side errors to avoid noisy ERROR logs
            if (e instanceof IllegalArgumentException || e instanceof org.springframework.web.method.annotation.MethodArgumentTypeMismatchException) {
                logger.warn("Error executing endpoint {}.{}: {}",
                        className, methodName, e.getMessage());
            } else {
                logger.error("Error executing endpoint {}.{}: {}",
                        className, methodName, e.getMessage(), e);
            }
            throw e;
        } finally {
            // Stop timing and record duration
            monitoringService.stopTimer(timerSample, "endpoint." + endpointName);

            // Log execution time for debugging
            logger.debug("Endpoint {}.{} executed in {} ms",
                    className, methodName, timerSample.stop(monitoringService.getOrCreateTimer(endpointName)));
        }
    }

    /**
     * Determines the HTTP method (GET, POST, etc.) from the method annotations
     */
    private String determineHttpMethod(Method method) {
        if (method.isAnnotationPresent(GetMapping.class)) {
            return "GET";
        } else if (method.isAnnotationPresent(PostMapping.class)) {
            return "POST";
        } else if (method.isAnnotationPresent(PutMapping.class)) {
            return "PUT";
        } else if (method.isAnnotationPresent(DeleteMapping.class)) {
            return "DELETE";
        } else if (method.isAnnotationPresent(RequestMapping.class)) {
            RequestMethod[] methods = method.getAnnotation(RequestMapping.class).method();
            if (methods.length > 0) {
                return methods[0].name();
            }
        }
        return "UNKNOWN";
    }
}