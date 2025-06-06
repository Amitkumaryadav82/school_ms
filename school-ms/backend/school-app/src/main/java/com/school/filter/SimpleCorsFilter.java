package com.school.filter;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * SimpleCorsFilter applies CORS headers to all responses.
 * This filter runs before the security filters to ensure OPTIONS requests get
 * the CORS headers.
 */
@Component
@Order(-100) // Ensure this runs before all other filters
public class SimpleCorsFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Nothing to do
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // Get origin from request header
        String origin = request.getHeader("Origin");

        // Apply CORS headers to all responses
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        } else {
            // For requests without an Origin header, allow local development origins
            response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        }

        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept, Authorization");

        // Special handling for OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            System.out.println(
                    "CORS Filter handling OPTIONS request from: " + origin + " to: " + request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            // For non-OPTIONS requests, continue the filter chain
            chain.doFilter(req, res);
        }
    }

    @Override
    public void destroy() {
        // Nothing to do
    }
}

