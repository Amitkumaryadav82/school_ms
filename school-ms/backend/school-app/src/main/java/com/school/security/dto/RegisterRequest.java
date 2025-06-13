package com.school.security.dto;

import com.school.security.UserRole;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private UserRole role;

    // Explicit getters and setters in case Lombok fails
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    // Static builder method
    public static RegisterRequestBuilder builder() {
        return new RegisterRequestBuilder();
    }
    
    // Manual builder implementation
    public static class RegisterRequestBuilder {
        private String username;
        private String fullName;
        private String email;
        private String password;
        private UserRole role;
        
        public RegisterRequestBuilder username(String username) { this.username = username; return this; }
        public RegisterRequestBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public RegisterRequestBuilder email(String email) { this.email = email; return this; }
        public RegisterRequestBuilder password(String password) { this.password = password; return this; }
        public RegisterRequestBuilder role(UserRole role) { this.role = role; return this; }
        
        public RegisterRequest build() {
            RegisterRequest request = new RegisterRequest();
            request.username = this.username;
            request.fullName = this.fullName;
            request.email = this.email;
            request.password = this.password;
            request.role = this.role;
            return request;
        }
    }
}
