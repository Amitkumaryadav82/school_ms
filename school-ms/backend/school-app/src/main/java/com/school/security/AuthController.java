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
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "APIs for user authentication and registration")
// Removed redundant @CrossOrigin annotation since we're using global CORS configuration from CorsConfig
@Slf4j
public class AuthController {

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
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.debug("Login attempt for user: {}", request.getUsername());
            AuthResponse response = authService.login(request);
            log.info("Login successful for user: {}", request.getUsername());
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            log.warn("Login failed for user: {} - Invalid credentials", request.getUsername());
            return ResponseEntity.status(401)
                    .body(new ErrorResponse("INVALID_CREDENTIALS", "Invalid username or password"));
        } catch (Exception e) {
            log.error("Login error for user: {}", request.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("SERVER_ERROR", "An unexpected error occurred"));
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
    })
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", System.currentTimeMillis(),
                "service", "authentication"));
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