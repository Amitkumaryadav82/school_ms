package com.school.security.dto;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
    
    /**
     * Gets the username
     * @return the username
     */
    public String getUsername() {
        return username;
    }
    
    /**
     * Gets the password
     * @return the password
     */
    public String getPassword() {
        return password;
    }
}
