package com.school.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.filter.CorsFilter;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

/**
 * Simplified security configuration for the School Management System.
 * Consolidates all security rules into a single configuration.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SimplifiedSecurityConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private final CorsFilter corsFilter;
    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final Environment environment;

    @Autowired
    public SimplifiedSecurityConfig(
            CorsFilter corsFilter, 
            UserDetailsService userDetailsService,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            Environment environment) {
        this.corsFilter = corsFilter;
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.environment = environment;
    }

    @Bean
    public JwtTokenProvider jwtTokenProvider() {
        return new JwtTokenProvider(jwtSecret, jwtExpiration);
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtTokenProvider());
        filter.setUserDetailsService(userDetailsService);
        return filter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Unified security filter chain with environment-specific adjustments
     */
    @Bean
    @Order(1)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Check if we're in development mode
        boolean isDev = Arrays.asList(environment.getActiveProfiles()).contains("dev");
        
        // Basic security configuration common to all environments
        http
            .headers(headers -> {
                if (isDev) {
                    headers.frameOptions(frame -> frame.disable()); // For H2 console access in dev
                } else {
                    headers.frameOptions(frame -> frame.sameOrigin())
                           .referrerPolicy(referrer -> referrer
                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN));
                }
            })
            .csrf(AbstractHttpConfigurer::disable) // Disabled for REST APIs
            .cors(cors -> {}) // Use the centralized CORS configuration 
            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                    .authenticationEntryPoint(jwtAuthenticationEntryPoint));
        
        // Configure authorization rules
        http.authorizeHttpRequests(auth -> {
            // Static resources
            auth.antMatchers(
                "/",
                "/index.html",
                "/**/*.js",
                "/**/*.css",
                "/**/*.html",
                "/**/*.json", 
                "/**/*.ico",
                "/**/*.png",
                "/assets/**",
                "/static/**", 
                "/css/**",
                "/js/**", 
                "/images/**",
                "/favicon.ico", 
                "/manifest.json",
                "/robots.txt").permitAll();
                
            // Auth endpoints - explicitly list all public endpoints
            auth.antMatchers(
                "/api/auth/login",
                "/api/auth/register",
                "/api/auth/health", 
                "/api/auth/refresh",
                "/api/auth/validate-token").permitAll();
                
            // Development tools
            auth.antMatchers("/h2-console/**").permitAll();
            auth.antMatchers("/actuator/**").permitAll();
                
            // API docs
            auth.antMatchers(
                "/v3/api-docs/**",
                "/v3/api-docs.yaml", 
                "/swagger-ui/**",
                "/swagger-ui.html", 
                "/swagger-resources/**",
                "/webjars/**",
                "/api-docs/**").permitAll();
                
            // SPA frontend routes
            auth.antMatchers(
                "/login",
                "/register", 
                "/dashboard",
                "/students", 
                "/teachers",
                "/courses", 
                "/admissions",
                "/reports", 
                "/admin",
                "/profile").permitAll();
                
            // Special handling for fee reports - ensure they are accessible
            auth.antMatchers("/api/fees/reports/**", "/api/fees/reports/fee-status").authenticated();
            auth.antMatchers("/api/fees/reports/download/**").authenticated();
                
            // All other API requests require authentication
            auth.anyRequest().authenticated();
        });
        
        // Add the filters
        http.addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}
