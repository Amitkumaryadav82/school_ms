package com.school.security;

import com.school.security.dto.AuthResponse;
import com.school.security.dto.LoginRequest;
import com.school.security.dto.RegisterRequest;
import com.school.security.exception.DuplicateUsernameException;
import com.school.security.exception.DuplicateEmailException;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// Removed Lombok slf4j import
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
// Removed Lombok Slf4j annotation
public class AuthService {
    // Use explicit Logger instead of Lombok
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);@Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserRepositoryLoggingWrapper userRepositoryLogger;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Processing registration request for username: {}", request.getUsername());
        
        if (userRepositoryLogger.existsByUsername(request.getUsername())) {
            log.warn("Registration failed: Username {} is already taken", request.getUsername());
            throw new DuplicateUsernameException("Username is already taken");
        }

        if (userRepositoryLogger.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email {} is already registered", request.getEmail());
            throw new DuplicateEmailException("Email is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .role(request.getRole())
                .build();

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .role(user.getRole())
                .message("User registered successfully")
                .build();
    }    public AuthResponse login(LoginRequest request) {
        try {
            log.info("Attempting authentication for user: {}", request.getUsername());
            log.debug("Checking if user exists in repository before authentication");
              // Check if user exists in repository using the logging wrapper
            Optional<User> userOpt = userRepositoryLogger.findByUsername(request.getUsername());
            boolean userExists = userOpt.isPresent();
            log.info("User '{}' exists in repository: {}", request.getUsername(), userExists);
            
            if (userExists) {
                User user = userOpt.get();
                log.info("Found user details - Username: {}, Role: {}, Account enabled: {}", 
                    user.getUsername(), user.getRole(), user.isEnabled());
                
                // Check other account properties that might cause authentication to fail
                if (!user.isAccountNonLocked()) {
                    log.warn("User account is locked! Authentication will fail.");
                }
                
                if (!user.isCredentialsNonExpired()) {
                    log.warn("User credentials are expired! Authentication will fail.");
                }
                
                if (!user.isAccountNonExpired()) {
                    log.warn("User account is expired! Authentication will fail.");
                }
                
                if (!user.isEnabled()) {
                    log.warn("User account is disabled! Authentication will fail.");
                }
                  // Check if password is empty or null
                String password = null;
                try {
                    // Access password directly from field if getter is not working
                    java.lang.reflect.Field passwordField = User.class.getDeclaredField("password");
                    passwordField.setAccessible(true);
                    password = (String) passwordField.get(user);
                } catch (Exception e) {
                    log.error("Failed to access password field via reflection", e);
                }
                
                if (password == null || password.isEmpty()) {
                    log.error("User has no password set! Authentication will fail.");
                } else {
                    // Log password hash format information to troubleshoot encoding issues
                    log.debug("Password hash format: {}", password.startsWith("$2a$") ? "BCrypt" : 
                                                      password.startsWith("{bcrypt}") ? "Spring BCrypt" :
                                                      "Unknown format");
                }
            } else {
                log.error("Authentication will fail - User does not exist in repository: {}", request.getUsername());
            }
              log.debug("Attempting to authenticate through AuthenticationManager");
            log.debug("Creating authentication token for username: {} with password of length: {}", 
                request.getUsername(), request.getPassword() != null ? request.getPassword().length() : 0);
            
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword());
                
            log.debug("Authentication token created successfully: {}", authToken);
            log.info("Submitting authentication request to AuthenticationManager...");            Authentication authentication = null;
            try {
                authentication = authenticationManager.authenticate(authToken);
                log.info("Authentication successful for user: {}", request.getUsername());
                log.debug("Authentication details: isAuthenticated={}, authorities={}", 
                    authentication.isAuthenticated(), 
                    authentication.getAuthorities());
                    
                // Return to original logic flow here
                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = tokenProvider.generateToken(authentication);
                User user = (User) authentication.getPrincipal();

                log.info("User logged in successfully: {}", user.getUsername());

                return AuthResponse.builder()
                        .token(jwt)
                        .username(user.getUsername())
                        .role(user.getRole())
                        .message("Login successful")
                        .build();
                          } catch (Exception e) {
                log.error("Authentication manager threw exception during authentication", e);
                // Re-throw to be caught by outer exception handler
                throw e;
            }
            // The code below is unreachable since the try block already returns a response
            // Removing unreachable code
        } catch (AuthenticationException e) {
            log.error("Authentication failed for user: {} - Reason: {}", request.getUsername(), e.getMessage());
            log.debug("Authentication exception details", e);
            throw new BadCredentialsException("Invalid username or password");
        } catch (Exception e) {
            log.error("Unexpected error during login for user: {}", request.getUsername(), e);
            throw e;
        }
    }

    /**
     * Refreshes an existing JWT token
     * 
     * @param token The existing token to refresh
     * @return A new token and user information
     */
    public AuthResponse refreshToken(String token) {
        // Validate the token and extract user details
        if (!tokenProvider.validateToken(token)) {
            log.error("Invalid token provided for refresh");
            throw new JwtException("Invalid or expired token");
        }

        String username = tokenProvider.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new JwtException("User not found"));

        log.info("Refreshing token for user: {}", username);

        // Generate a new token
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities());
        String newToken = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(newToken)
                .username(user.getUsername())
                .role(user.getRole())
                .message("Token refreshed successfully")
                .build();
    }

    /**
     * Validates if a JWT token is valid
     * 
     * @param token The JWT token to validate
     * @return true if the token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        log.debug("Validating token in AuthService");
        if (token == null || token.isEmpty()) {
            log.warn("Token validation failed: Token is null or empty");
            return false;
        }

        try {
            boolean isValid = tokenProvider.validateToken(token);
            if (isValid) {
                log.debug("Token validated successfully");
            } else {
                log.warn("Token validation failed: Invalid token structure");
            }
            return isValid;
        } catch (Exception e) {
            log.error("Error validating token", e);            return false;
        }
    }
    
    /**
     * Check if a user exists by username - used for debugging
     * @param username the username to check
     * @return true if the user exists
     */
    public boolean userExists(String username) {
        log.info("Checking if user exists: {}", username);
        
        Optional<User> user = userRepositoryLogger.findByUsername(username);
        
        if (user.isPresent()) {
            User foundUser = user.get();
            log.info("Debug: User found with ID: {}", foundUser.getId());
            log.info("Debug: User role: {}", foundUser.getRole());
            log.info("Debug: User account status - enabled: {}, non-expired: {}, non-locked: {}, credentials non-expired: {}", 
                foundUser.isEnabled(), 
                foundUser.isAccountNonExpired(),
                foundUser.isAccountNonLocked(),
                foundUser.isCredentialsNonExpired());
                
            // Check password (without revealing it)
            if (foundUser.getPassword() == null) {
                log.warn("Debug: User has NULL password");
            } else if (foundUser.getPassword().isEmpty()) {
                log.warn("Debug: User has EMPTY password");
            } else {
                log.info("Debug: User has password with length: {}", foundUser.getPassword().length());
                // Log first characters of hash to identify algorithm
                String hashPrefix = foundUser.getPassword().substring(0, Math.min(8, foundUser.getPassword().length()));
                log.info("Debug: Password hash starts with: {}...", hashPrefix);
            }
            
            return true;
        } else {
            log.warn("Debug: User '{}' not found", username);            return false;
        }
    }    /* Removed duplicate userExists method */
    
    /**
     * Test method for password encoding
     * For debugging only - should be removed in production
     */
    public String testPasswordEncoding(String rawPassword) {
        log.info("Testing password encoding for string of length: {}", rawPassword.length());
        try {
            String encoded = passwordEncoder.encode(rawPassword);
            log.info("Password encoded successfully, resulting in string of length: {}", encoded.length());
            log.info("Password encoding type: {}", 
                encoded.startsWith("$2a$") ? "BCrypt" : 
                encoded.startsWith("{bcrypt}") ? "Spring BCrypt" : 
                "Unknown");
            return encoded;
        } catch (Exception e) {
            log.error("Error encoding password", e);
            throw e;
        }
    }
    
    /**
     * Test method for direct authentication with AuthenticationManager
     * For debugging purposes only
     */
    public Authentication testDirectAuthentication(String username, String password) {
        log.info("Testing direct authentication for username: {}", username);
        
        try {
            // First check if user exists in repo
            Optional<User> userOpt = userRepositoryLogger.findByUsername(username);
            boolean userExists = userOpt.isPresent();
            
            log.info("User exists check before authentication: {}", userExists);
            
            if (userExists) {
                // Log the current stored password hash for comparison
                User user = userOpt.get();
                String storedHash = user.getPassword();
                log.info("Stored password hash format: {}", 
                    storedHash.startsWith("$2a$") ? "BCrypt" : 
                    storedHash.startsWith("{bcrypt}") ? "Spring BCrypt" : 
                    "Unknown format");
                log.info("Stored hash prefix: {}...", 
                    storedHash.substring(0, Math.min(15, storedHash.length())));
                
                // Test if the password encoder would match the provided raw password
                boolean wouldMatch = passwordEncoder.matches(password, storedHash);
                log.info("Password encoder direct match test: {}", wouldMatch);
            }
            
            // Try actual authentication
            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(username, password);
                
            log.info("Submitting authentication token to AuthenticationManager");
            
            Authentication authentication = authenticationManager.authenticate(authToken);
            log.info("Direct authentication successful");
            
            return authentication;
        } catch (AuthenticationException e) {
            log.error("Direct authentication test failed", e);
            throw e;
        }
    }
}