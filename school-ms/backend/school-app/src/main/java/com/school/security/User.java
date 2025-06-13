package com.school.security;

import com.school.common.model.Auditable;
import javax.persistence.*;
import javax.validation.constraints.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends Auditable implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String username;

    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    @Column(unique = true)
    private String email;

    @NotBlank
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Builder.Default
    private boolean enabled = true;

    @Builder.Default
    private boolean accountNonExpired = true;

    @Builder.Default
    private boolean accountNonLocked = true;

    @Builder.Default
    private boolean credentialsNonExpired = true;

    // Static builder method in case Lombok fails
    public static UserBuilder builder() {
        return new UserBuilder();
    }
      // Manual builder implementation
    public static class UserBuilder {
        private Long id;
        private String username;
        private String fullName;
        private String password;
        private String email;
        private UserRole role;
        private boolean enabled = true;
        private boolean accountNonExpired = true;
        private boolean accountNonLocked = true;
        private boolean credentialsNonExpired = true;
        
        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder role(UserRole role) { this.role = role; return this; }
        
        // Overloaded role method that accepts String
        public UserBuilder role(String roleStr) {
            if (roleStr != null) {
                try {
                    this.role = UserRole.valueOf(roleStr.toUpperCase());
                } catch (IllegalArgumentException e) {
                    // Default to STUDENT if invalid role
                    this.role = UserRole.STUDENT;
                }
            }
            return this;
        }
        
        public UserBuilder enabled(boolean enabled) { this.enabled = enabled; return this; }
        public UserBuilder accountNonExpired(boolean accountNonExpired) { this.accountNonExpired = accountNonExpired; return this; }
        public UserBuilder accountNonLocked(boolean accountNonLocked) { this.accountNonLocked = accountNonLocked; return this; }
        public UserBuilder credentialsNonExpired(boolean credentialsNonExpired) { this.credentialsNonExpired = credentialsNonExpired; return this; }
        
        public User build() {
            User user = new User();
            user.id = this.id;
            user.username = this.username;
            user.fullName = this.fullName;
            user.password = this.password;
            user.email = this.email;
            user.role = this.role;
            user.enabled = this.enabled;
            user.accountNonExpired = this.accountNonExpired;
            user.accountNonLocked = this.accountNonLocked;
            user.credentialsNonExpired = this.credentialsNonExpired;
            return user;
        }
    }
      // UserDetails interface implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + (role != null ? role.name() : "STUDENT")));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    // Regular getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
      public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    // Overloaded setRole method that accepts String
    public void setRole(String roleStr) {
        if (roleStr != null) {
            try {
                this.role = UserRole.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                this.role = UserRole.STUDENT;
            }
        }
    }
    
    // Helper method to get role as string
    public String getRoleAsString() {
        return role != null ? role.name() : null;
    }
    
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
