package com.school.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

/**
 * This class previously contained duplicate CORS configuration.
 * CORS settings have been consolidated in CorsConfig.java.
 * 
 * This class is kept as a placeholder in case we need to add additional
 * security
 * configurations that are not directly related to CORS in the future.
 */
@Configuration
@Order(1)
public class WebSecurityConfig {
    // All CORS configuration moved to CorsConfig.java
}
