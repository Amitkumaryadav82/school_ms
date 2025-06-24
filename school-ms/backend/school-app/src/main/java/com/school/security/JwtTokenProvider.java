package com.school.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
import java.nio.charset.StandardCharsets;
// Removed Lombok slf4j import
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
// Removed Lombok Slf4j annotation
public class JwtTokenProvider {
    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey key;
    private final long jwtExpiration;

    public JwtTokenProvider(String jwtSecret, long jwtExpiration) {
        log.debug("Initializing JwtTokenProvider with expiration time: {} ms", jwtExpiration);
        // Generate a secure key for HS512 algorithm
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.jwtExpiration = jwtExpiration;
        log.debug("JWT secret key initialized with length: {}", jwtSecret.length());
    }    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        log.debug("Generating token for user: {}", userDetails.getUsername());
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        log.debug("Token issuance time: {}, expiry time: {}", now, expiryDate);
        
        // Add claims including authorities/roles
        Claims claims = Jwts.claims().setSubject(userDetails.getUsername());
        
        // Add roles as a claim
        var authorities = userDetails.getAuthorities().stream()
                .map(Object::toString)
                .toList();
                
        log.debug("Adding authorities to token: {}", authorities);
        claims.put("roles", authorities);

        log.debug("Building JWT token with claims");
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }    public String getUsernameFromToken(String token) {
        log.debug("Extracting username from token");
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
                    
            String username = claims.getSubject();
            log.debug("Username extracted from token: {}", username);
            return username;
        } catch (Exception e) {
            log.error("Error extracting username from token", e);
            throw e;
        }
    }

    public boolean validateToken(String token) {
        log.debug("Validating JWT token");
        if (token == null) {
            log.warn("Token is null - cannot validate");
            return false;
        }
        
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
                    
            log.debug("Token validation successful");
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT token: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT token: {}", e.getMessage());
            return false;
        } catch (SignatureException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
            return false;
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("JWT token validation failed: {}", ex.getMessage());
            return false;
        }
    }
}