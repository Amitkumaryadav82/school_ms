package com.school.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.Arrays;
import java.util.List;

/**
 * Unified CORS configuration for the application.
 * 
 * Provides a single source of truth for CORS settings to avoid configuration
 * conflicts.
 * Uses values from application.properties.
 */
@Configuration
@Order(1) // Ensure this filter runs before others
public class CorsConfig {

    @Value("${cors.allowed-origins:http://localhost:8080,http://localhost:5173,http://localhost:5174,http://localhost:3000}")
    private String allowedOriginsStr;

    @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS,PATCH}")
    private String allowedMethodsStr;

    @Value("${cors.max-age:3600}")
    private long maxAge;

    /**
     * Universal CORS filter that works for all environments
     */
    @Bean(name = "corsFilter")
    public CorsFilter corsFilter() {
        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        final CorsConfiguration config = new CorsConfiguration();

        // Parse allowed origins from properties file
        List<String> allowedOrigins = Arrays.asList(allowedOriginsStr.split(","));
        allowedOrigins.forEach(origin -> {
            // Trim any whitespace from the origin
            config.addAllowedOrigin(origin.trim());
            System.out.println("CORS: Added allowed origin: " + origin.trim());
        });

        // Parse allowed methods from properties file
        List<String> allowedMethods = Arrays.asList(allowedMethodsStr.split(","));
        config.setAllowedMethods(allowedMethods);
        System.out.println("CORS: Configured methods: " + allowedMethods);

        // Allow common headers and any additional headers that might be needed
        config.addAllowedHeader("*"); // This allows all headers for simplicity

        // Expose headers that frontend might need
        config.setExposedHeaders(Arrays.asList(
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials",
                "Access-Control-Allow-Headers",
                "Access-Control-Allow-Methods",
                "Content-Disposition",
                "Authorization"));

        // Allow credentials (cookies, authorization headers, TLS client certs)
        config.setAllowCredentials(true);

        // Set max age for preflight requests
        config.setMaxAge(maxAge);

        // Register the configuration for all paths
        source.registerCorsConfiguration("/**", config);
        System.out.println("CORS filter configured successfully with " + allowedOrigins.size() + " origins");

        return new CorsFilter(source);
    }
}