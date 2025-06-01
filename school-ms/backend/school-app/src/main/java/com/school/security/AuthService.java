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
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateUsernameException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
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
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

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
        } catch (AuthenticationException e) {
            log.error("Authentication failed for user: {}", request.getUsername());
            throw new BadCredentialsException("Invalid username or password");
        } catch (Exception e) {
            log.error("Unexpected error during login", e);
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
            log.error("Error validating token", e);
            return false;
        }
    }
}