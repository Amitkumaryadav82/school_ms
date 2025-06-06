package com.school.fee.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.cors.CorsUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This is a diagnostic controller for CORS testing.
 * It deliberately bypasses security to help diagnose CORS issues.
 */
@RestController
@RequestMapping("/api/diagnostics")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.OPTIONS })
public class CorsTestController {

    @GetMapping("/cors-test")
    public ResponseEntity<String> corsTest(HttpServletRequest request) {
        StringBuilder responseText = new StringBuilder();
        responseText.append("CORS Test Successful\n");

        // Add request info for debugging
        responseText.append("Request origin: ").append(request.getHeader("Origin")).append("\n");
        responseText.append("Is preflight: ").append(CorsUtils.isPreFlightRequest(request)).append("\n");

        // Log headers for debugging
        responseText.append("Request headers:\n");
        request.getHeaderNames().asIterator().forEachRemaining(headerName -> {
            responseText.append("  ").append(headerName).append(": ").append(request.getHeader(headerName))
                    .append("\n");
        });

        return ResponseEntity.ok(responseText.toString());
    }

    @PostMapping("/cors-test")
    public ResponseEntity<String> corsTestPost() {
        return ResponseEntity.ok("CORS POST Test Successful");
    }

    // For more detailed validation of headers
    @GetMapping("/validate-headers")
    public void validateHeaders(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"));
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "3600");

        // Add response body
        try {
            response.getWriter().write("Headers validated and set correctly");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // For handling OPTIONS requests directly
    @RequestMapping(value = "/preflight", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
        return ResponseEntity
                .ok()
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "*")
                .header("Access-Control-Max-Age", "3600")
                .build();
    }
}

