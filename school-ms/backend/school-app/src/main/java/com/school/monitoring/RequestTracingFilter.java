package com.school.monitoring;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter to add request tracing functionality to the application.
 * Generates a unique trace ID for each request and logs request performance
 * metrics.
 */
@Component
public class RequestTracingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestTracingFilter.class);
    private static final String TRACE_ID = "traceId";
    private static final String START_TIME = "startTime";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Generate a unique trace ID for this request
        String traceId = generateTraceId();

        // Store the trace ID in the MDC for logging
        MDC.put(TRACE_ID, traceId);

        // Add trace ID to response headers for client-side tracking
        response.addHeader("X-Trace-Id", traceId);

        // Record start time
        long startTime = System.currentTimeMillis();
        request.setAttribute(START_TIME, startTime);

        try {
            // Continue with the request
            filterChain.doFilter(request, response);
        } finally {
            // Calculate request duration
            long duration = System.currentTimeMillis() - startTime;

            // Log request details
            logger.info(
                    "Request completed - method: {}, uri: {}, status: {}, duration: {} ms, trace: {}",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    duration,
                    traceId);

            // Clean up the MDC
            MDC.remove(TRACE_ID);
        }
    }

    /**
     * Generates a unique trace ID for the request.
     * 
     * @return A unique trace ID string
     */
    private String generateTraceId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
