package com.school.security;

import com.school.security.dto.AuthResponse;
import com.school.security.dto.LoginRequest;
import com.school.security.dto.RegisterRequest;
import com.school.security.exception.DuplicateUsernameException;
import com.school.security.exception.DuplicateEmailException;
import io.jsonwebtoken.JwtException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import javax.servlet.http.HttpServletRequest;
import java.util.Enumeration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "APIs for user authentication and registration")
// Removed redundant @CrossOrigin annotation since we're using global CORS configuration from CorsConfig
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Operation(summary = "Register new user", description = "Register a new user in the system")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data or username/email already exists")
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (DuplicateUsernameException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("USERNAME_EXISTS", e.getMessage()));
        } catch (DuplicateEmailException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("EMAIL_EXISTS", e.getMessage()));
        } catch (Exception e) {
            log.error("Error during registration", e);
            return ResponseEntity.badRequest().body(new ErrorResponse("REGISTRATION_ERROR", e.getMessage()));
        }
    }

    @Operation(summary = "User login", description = "Authenticate user and generate JWT token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("=== Login request received ===");
            log.info("Login attempt for user: {}", request.getUsername());
            log.debug("Request headers: {}", getRequestHeadersForLogging());
            log.debug("Request IP: {}", getClientIpAddress());
            log.debug("Password length: {}", request.getPassword() != null ? request.getPassword().length() : 0);
            
            AuthResponse response = authService.login(request);
            
            log.info("Login successful for user: {}", request.getUsername());
            log.debug("Response token present: {}", response.getToken() != null);
            log.debug("Response username: {}", response.getUsername());
            log.debug("Response role: {}", response.getRole());
            
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            log.warn("Login failed for user: {} - Invalid credentials", request.getUsername());
            log.debug("BadCredentialsException details: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(new ErrorResponse("INVALID_CREDENTIALS", "Invalid username or password"));
        } catch (Exception e) {
            log.error("Login error for user: {} - Error type: {}", request.getUsername(), e.getClass().getName());
            log.error("Error message: {}", e.getMessage());
            log.error("Full stack trace:", e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("SERVER_ERROR", "An unexpected error occurred"));
        }
    }
    
    // Helper method to get request headers for logging
    private String getRequestHeadersForLogging() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            StringBuilder headers = new StringBuilder();
            Enumeration<String> headerNames = request.getHeaderNames();
            
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                // Skip sensitive headers
                if (!headerName.equalsIgnoreCase("Authorization") && 
                    !headerName.equalsIgnoreCase("Cookie")) {
                    headers.append(headerName).append(": ")
                           .append(request.getHeader(headerName)).append(", ");
                }
            }
            
            return headers.toString();
        } catch (Exception e) {
            log.warn("Could not extract request headers: {}", e.getMessage());
            return "Could not extract headers";
        }
    }
    
    // Helper method to get client IP address
    private String getClientIpAddress() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("Proxy-Client-IP");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("WL-Proxy-Client-IP");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("HTTP_CLIENT_IP");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("HTTP_X_FORWARDED_FOR");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getRemoteAddr();
            }
            
            return ip;
        } catch (Exception e) {
            log.warn("Could not extract client IP: {}", e.getMessage());
            return "Could not extract IP";
        }
    }

    @Operation(summary = "Refresh token", description = "Refresh an existing JWT token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
            @ApiResponse(responseCode = "401", description = "Invalid or expired token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            if (token == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("INVALID_REQUEST", "Token is required"));
            }

            log.debug("Token refresh attempt");
            AuthResponse response = authService.refreshToken(token);
            log.info("Token refreshed successfully");
            return ResponseEntity.ok(response);
        } catch (JwtException e) {
            log.warn("Token refresh failed - Invalid token: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(new ErrorResponse("INVALID_TOKEN", e.getMessage()));
        } catch (Exception e) {
            log.error("Token refresh error", e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("SERVER_ERROR", "An unexpected error occurred"));
        }
    }

    @Operation(summary = "Validate token", description = "Validate an existing JWT token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token is valid"),
            @ApiResponse(responseCode = "401", description = "Invalid or expired token")
    })
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            if (token == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "valid", false,
                        "message", "Token is required"));
            }

            log.debug("Token validation attempt");
            boolean isValid = authService.validateToken(token);

            if (isValid) {
                log.info("Token validated successfully");
                return ResponseEntity.ok(Map.of("valid", true));
            } else {
                log.warn("Token validation failed - Invalid token");
                return ResponseEntity.status(401).body(Map.of(
                        "valid", false,
                        "message", "Token is invalid or expired"));
            }
        } catch (JwtException e) {
            log.warn("Token validation failed - Invalid token: {}", e.getMessage());
            return ResponseEntity.status(401).body(Map.of(
                    "valid", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Token validation error", e);
            return ResponseEntity.status(500).body(Map.of(
                    "valid", false,
                    "message", "An unexpected error occurred during token validation"));
        }
    }

    @Operation(summary = "Authentication health check", description = "Check if authentication endpoints are accessible")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentication service is healthy")
    })    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", System.currentTimeMillis(),
                "service", "authentication"));
    }
    
    /**
     * Diagnostic endpoint to check if a user exists in the system
     * NOTE: This endpoint is for debugging purposes only and should be removed in production
     */    @GetMapping("/debug/check-user/{username}")
    public ResponseEntity<?> checkUserExists(@PathVariable String username) {
        log.info("Diagnostic check requested for username: {}", username);
        try {
            boolean exists = authService.userExists(username);
            if (exists) {
                log.info("Debug endpoint: User '{}' exists", username);
                return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "username", username,
                    "message", "User exists in the database"
                ));
            } else {                log.warn("Debug endpoint: User '{}' does not exist", username);
                return ResponseEntity.ok(Map.of(
                    "exists", false,
                    "username", username,
                    "message", "User does not exist in the database"
                ));
            }
        } catch (Exception e) {
            log.error("Error in debug endpoint", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to check user",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Debug endpoint to test password encoding
     * NOTE: This endpoint is for debugging purposes only and should be removed in production
     */
    @PostMapping("/debug/test-password-encoding")
    public ResponseEntity<?> testPasswordEncoding(@RequestBody Map<String, String> request) {
        try {
            String rawPassword = request.get("password");
            if (rawPassword == null || rawPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Password is required"
                ));
            }
            
            log.info("Testing password encoding");
            String encodedPassword = authService.testPasswordEncoding(rawPassword);
            
            return ResponseEntity.ok(Map.of(
                "rawLength", rawPassword.length(),
                "encodedLength", encodedPassword.length(),
                "encoded", encodedPassword,
                "encodedSample", encodedPassword.substring(0, Math.min(20, encodedPassword.length())) + "..."
            ));
        } catch (Exception e) {
            log.error("Error testing password encoding", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to test password encoding",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Debug endpoint to test authentication directly with the AuthenticationManager
     * NOTE: This endpoint is for debugging purposes only and should be removed in production
     */
    @PostMapping("/debug/test-authentication")
    public ResponseEntity<?> testAuthentication(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            
            if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Username and password are required"
                ));
            }
            
            log.info("Testing direct authentication for user: {}", username);
            
            try {
                Authentication auth = authService.testDirectAuthentication(username, password);
                
                return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "username", username,
                    "authorities", auth.getAuthorities().toString(),
                    "message", "Authentication succeeded"
                ));
            } catch (BadCredentialsException e) {
                log.warn("Direct authentication test failed for {}: Bad credentials", username);
                return ResponseEntity.status(401).body(Map.of(
                    "authenticated", false,
                    "username", username,
                    "message", "Bad credentials"
                ));
            }
        } catch (Exception e) {
            log.error("Error testing authentication", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to test authentication",
                "message", e.getMessage()
            ));
        }
    }
}

class ErrorResponse {
    private String code;
    private String message;

    public ErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
