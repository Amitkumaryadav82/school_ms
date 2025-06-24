package com.school.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Component responsible for ensuring that default users exist in the system.
 * This runs on application startup to create admin user if it doesn't exist.
 */
@Component
public class DefaultUserInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DefaultUserInitializer.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking if default admin user exists...");
        
        // Check if admin user exists
        if (!userRepository.existsByUsername("admin")) {
            log.info("Default admin user not found. Creating admin user...");
            
            // Create default admin user
            User adminUser = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .email("admin@schoolms.com")
                    .fullName("System Administrator")
                    .role(UserRole.ADMIN)
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .build();
            
            userRepository.save(adminUser);
            
            log.info("Default admin user created successfully");
        } else {
            log.info("Default admin user already exists");
            
            // Debug: Check the password formatting of the existing admin user
            userRepository.findByUsername("admin").ifPresent(user -> {
                String passwordHash = user.getPassword();
                log.info("Admin user password hash: {}", 
                    passwordHash.substring(0, Math.min(20, passwordHash.length())) + "...");
                log.info("Password hash format: {}", 
                    passwordHash.startsWith("$2a$") ? "BCrypt" : 
                    passwordHash.startsWith("{bcrypt}") ? "Spring BCrypt" : 
                    "Unknown format");
                
                // Check if password needs to be updated
                if (!passwordEncoder.matches("admin", passwordHash)) {
                    log.warn("Admin password does not match expected value 'admin'. Resetting password...");
                    user.setPassword(passwordEncoder.encode("admin"));
                    userRepository.save(user);
                    log.info("Admin password has been reset");
                }
            });
        }
    }
}
