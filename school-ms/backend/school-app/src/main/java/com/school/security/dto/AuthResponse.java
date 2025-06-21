package com.school.security.dto;

import com.school.security.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private UserRole role;
    private String message;
    
    /**
     * Create a new builder for AuthResponse
     * @return a new builder instance
     */
    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }
}