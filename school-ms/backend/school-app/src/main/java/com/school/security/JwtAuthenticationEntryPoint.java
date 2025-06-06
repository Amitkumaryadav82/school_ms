package com.school.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationEntryPoint.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        logger.error("Unauthorized access error: {}", authException.getMessage());
        logger.debug("Request URI: {}", request.getRequestURI());
        logger.debug("Method: {}", request.getMethod());
        logger.debug("Authorization header: {}", request.getHeader("Authorization"));
        
        // Check if there is an authentication in the SecurityContext
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            logger.debug("Authentication exists: {}", SecurityContextHolder.getContext().getAuthentication());
            logger.debug("Authorities: {}", SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        } else {
            logger.debug("No authentication in SecurityContext");
        }
        
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        Map<String, Object> error = new HashMap<>();
        error.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        error.put("error", "Unauthorized");
        error.put("message", authException.getMessage());
        error.put("path", request.getRequestURI());
        
        objectMapper.writeValue(response.getOutputStream(), error);
    }
}

