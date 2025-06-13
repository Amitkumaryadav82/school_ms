package com.school.security.dto;

import com.school.security.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private UserRole role;
    private String message;

    // Explicit getters and setters in case Lombok fails
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    // Static builder method
    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }
    
    // Manual builder implementation
    public static class AuthResponseBuilder {
        private String token;
        private String username;
        private UserRole role;
        private String message;
        
        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder username(String username) { this.username = username; return this; }
        public AuthResponseBuilder role(UserRole role) { this.role = role; return this; }
        public AuthResponseBuilder message(String message) { this.message = message; return this; }
        
        public AuthResponse build() {
            AuthResponse response = new AuthResponse();
            response.token = this.token;
            response.username = this.username;
            response.role = this.role;
            response.message = this.message;
            return response;
        }
    }
}