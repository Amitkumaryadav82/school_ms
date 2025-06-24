package com.school.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Component that ensures the default admin user exists in the database 
 * when the application starts up.
 */
@Component
public class InitialAdminUserSetup implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(InitialAdminUserSetup.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserRepositoryLoggingWrapper userRepositoryLogger;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking if default admin user exists...");
        
        if (!userRepositoryLogger.existsByUsername("admin")) {
            log.info("Creating default admin user");
            
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
            // Check if the password needs to be reset for testing purposes
            log.info("Default admin user already exists");
            
            userRepositoryLogger.findByUsername("admin").ifPresent(admin -> {
                // Check if the password hash looks right
                String currentHash = admin.getPassword();
                if (currentHash == null || currentHash.isEmpty()) {
                    log.warn("Admin user has no password! Setting default password.");
                    admin.setPassword(passwordEncoder.encode("admin"));
                    userRepository.save(admin);
                    log.info("Admin password has been reset");
                } else {
                    // Test if the default password would work
                    boolean matches = passwordEncoder.matches("admin", currentHash);
                    log.info("Password test for admin user: would 'admin' match stored hash? {}", matches);
                    
                    if (!matches) {
                        log.warn("Admin password doesn't match expected value. Resetting to default password.");
                        admin.setPassword(passwordEncoder.encode("admin"));
                        userRepository.save(admin);
                        log.info("Admin password has been reset to 'admin'");
                    }
                }
            });
        }
    }
}
