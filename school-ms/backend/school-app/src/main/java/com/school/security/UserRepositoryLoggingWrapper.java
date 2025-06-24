package com.school.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A wrapper for UserRepository that adds detailed logging
 * This is used to help troubleshoot authentication issues
 */
@Component
public class UserRepositoryLoggingWrapper {
    
    private static final Logger log = LoggerFactory.getLogger(UserRepositoryLoggingWrapper.class);
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Find a user by username with enhanced logging
     * @param username the username to search for
     * @return Optional containing the user if found
     */
    public Optional<User> findByUsername(String username) {
        log.info("🔍 Searching for user with username: {}", username);
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            log.info("✅ User found: {}", username);
            log.debug("User details - ID: {}, Role: {}, Email: {}, Enabled: {}, AccountNonLocked: {}", 
                user.getId(),
                user.getRole(),
                user.getEmail(),
                user.isEnabled(),
                user.isAccountNonLocked()
            );
            
            // Do not log password details, just check if password is present
            if (user.getPassword() == null) {
                log.warn("⚠️ User found but password is null");
            } else if (user.getPassword().isEmpty()) {
                log.warn("⚠️ User found but password is empty");
            } else {
                log.debug("Password hash exists with length: {}", user.getPassword().length());
                log.debug("Password hash starts with: {}", user.getPassword().substring(0, Math.min(10, user.getPassword().length())) + "...");
            }
        } else {
            log.warn("❌ User not found with username: {}", username);
        }
        
        return userOpt;
    }
    
    /**
     * Check if a user exists by username with enhanced logging
     * @param username the username to check
     * @return true if the user exists
     */
    public boolean existsByUsername(String username) {
        log.info("🔍 Checking if user exists with username: {}", username);
        boolean exists = userRepository.existsByUsername(username);
        log.info("User {} exists: {}", username, exists);
        return exists;
    }
    
    /**
     * Find a user by email with enhanced logging
     * @param email the email to search for
     * @return Optional containing the user if found
     */
    public Optional<User> findByEmail(String email) {
        log.info("🔍 Searching for user with email: {}", email);
        Optional<User> userOpt = userRepository.findByEmail(email);
        log.info("User with email {} found: {}", email, userOpt.isPresent());
        return userOpt;
    }
    
    /**
     * Check if a user exists by email with enhanced logging
     * @param email the email to check
     * @return true if the user exists
     */
    public boolean existsByEmail(String email) {
        log.info("🔍 Checking if user exists with email: {}", email);
        boolean exists = userRepository.existsByEmail(email);
        log.info("User with email {} exists: {}", email, exists);
        return exists;
    }
    
    /**
     * Save a user with enhanced logging
     * @param user the user to save
     * @return the saved user
     */
    public User save(User user) {
        log.info("💾 Saving user: {}", user.getUsername());
        return userRepository.save(user);
    }
}
