package com.school.security.dto;

import com.school.security.UserRole;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
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
      /* Builder will be generated by Lombok annotation */
      /* Getters and setters will be generated by Lombok @Data annotation */
    
    /**
     * Gets the email address
     * @return the email address
     */
    public String getEmail() {
        return email;
    }
    
    /**
     * Gets the password
     * @return the password
     */
    public String getPassword() {
        return password;
    }
    
    /**
     * Gets the user role
     * @return the user role
     */
    public UserRole getRole() {
        return role;
    }
}
