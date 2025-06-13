package com.school.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
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
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.filter.CorsFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.core.userdetails.UserDetailsService;

/**
 * Unified security configuration for the School Management System.
 * In a monolithic application, having a single security configuration
 * simplifies management and reduces potential conflicts between different
 * security rules.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

        @Value("${jwt.secret}")
        private String jwtSecret;

        @Value("${jwt.expiration}")
        private long jwtExpiration;
        private final CorsFilter corsFilter;
        private final UserDetailsService userDetailsService;
        private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

        public SecurityConfig(CorsFilter corsFilter, UserDetailsService userDetailsService,
                        JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
                // Inject the corsFilter from CorsConfig
                this.corsFilter = corsFilter;
                this.userDetailsService = userDetailsService;
                this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
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
         * Main security filter chain for the monolithic application.
         * Handles both static resources and API endpoints in a single configuration.
         */
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                // Security headers configuration
                                .headers(headers -> headers
                                                .frameOptions(frame -> frame.sameOrigin())
                                                .referrerPolicy(referrer -> referrer
                                                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))) // Disable
                                                                                                                                                     // CSRF
                                                                                                                                                     // for
                                                                                                                                                     // REST
                                                                                                                                                     // APIs
                                                                                                                                                     // and
                                                                                                                                                     // static
                                                                                                                                                     // resources
                                .csrf(AbstractHttpConfigurer::disable)
                                // Use the centralized CORS configuration from CorsConfig
                                .cors(cors -> {
                                })// Use stateless sessions for API calls
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // Set up exception handlers
                                .exceptionHandling(exceptions -> exceptions
                                                .authenticationEntryPoint(jwtAuthenticationEntryPoint))                                // Configure authorization rules
                                .authorizeHttpRequests(auth -> {
                                        // First, explicitly permit all static resources with very specific patterns
                                        auth.antMatchers(
                                                        "/",
                                                        "/index.html",
                                                        "/*.js",
                                                        "/*.css",
                                                        "/*.json",
                                                        "/*.ico",
                                                        "/*.png",
                                                        "/assets/**",
                                                        "/static/**",
                                                        "/css/**",
                                                        "/js/**",
                                                        "/images/**",
                                                        "/favicon.ico",
                                                        "/manifest.json",
                                                        "/robots.txt").permitAll();                                        // Auth endpoints - explicitly list all public endpoints for clarity
                                        auth.antMatchers(
                                                        "/api/auth/login",
                                                        "/api/auth/register",
                                                        "/api/auth/health",
                                                        "/api/auth/refresh",
                                                        "/api/auth/validate-token").permitAll();
                                                        
                                        // Exam types endpoint - should be accessible without authentication
                                        auth.antMatchers("/api/exams/types").permitAll();

                                        auth.antMatchers("/h2-console/**").permitAll();
                                        auth.antMatchers("/actuator/**").permitAll();// IMPORTANT: Override the method-level security for fee report endpoints
                                        // to ensure they are accessible by both ADMIN and TEACHER roles
                                        auth.antMatchers("/api/fees/reports/**", "/api/fees/reports/fee-status")
                                                        .authenticated();
                                        auth.antMatchers("/api/fees/reports/download/**").authenticated();

                                        // Swagger/OpenAPI documentation
                                        auth.antMatchers(
                                                        "/v3/api-docs/**",
                                                        "/v3/api-docs.yaml",
                                                        "/swagger-ui/**",
                                                        "/swagger-ui.html",
                                                        "/swagger-resources/**",
                                                        "/webjars/**",
                                                        "/api-docs/**").permitAll();                                        // SPA frontend routes
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
                                                        "/profile").permitAll(); // All other API requests require
                                                                                 // authentication
                                        auth.anyRequest().authenticated();
                                })
                                // Add the corsFilter and JWT filter in the correct order
                                .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        /**
         * Development-specific security configuration with more permissive settings.
         * Only active when the 'dev' profile is active.
         */
        @Bean
        @Profile("dev")
        public SecurityFilterChain devFilterChain(HttpSecurity http) throws Exception {
                http
                                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                                .csrf(AbstractHttpConfigurer::disable)
                                // Also use the centralized CORS configuration in dev mode
                                .cors(cors -> {
                                })
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // Set up exception handlers - this was missing in dev config
                                .exceptionHandling(exceptions -> exceptions
                                                .authenticationEntryPoint(jwtAuthenticationEntryPoint))                                .authorizeHttpRequests(auth -> { // All static resources
                                        auth.antMatchers("/**/*.js",
                                                        "/**/*.css",
                                                        "/**/*.html",
                                                        "/**/*.json",
                                                        "/**/*.ico",
                                                        "/**/*.png",
                                                        "/",
                                                        "/index.html",
                                                        "/static/**",
                                                        "/assets/**",
                                                        "/css/**",
                                                        "/js/**",
                                                        "/images/**",
                                                        "/favicon.ico",
                                                        "/manifest.json",
                                                        "/robots.txt").permitAll();

                                        // Allow access to H2 console in dev mode
                                        auth.antMatchers("/h2-console/**").permitAll();
                                        auth.antMatchers("/actuator/**").permitAll();                                        // Auth endpoints - explicitly list all public endpoints for clarity
                                        auth.antMatchers(
                                                        "/api/auth/login",
                                                        "/api/auth/register",
                                                        "/api/auth/health",
                                                        "/api/auth/refresh",
                                                        "/api/auth/validate-token").permitAll();
                                                        
                                        // Exam types endpoint - should be accessible without authentication
                                        auth.antMatchers("/api/exams/types").permitAll();

                                        // Fee reports endpoints - ensure consistency with main config
                                        auth.antMatchers("/api/fees/reports/**", "/api/fees/reports/fee-status")
                                                        .authenticated();
                                        auth.antMatchers("/api/fees/reports/download/**").authenticated();

                                        // API docs - expanded to match main config
                                        auth.antMatchers(
                                                        "/v3/api-docs/**",
                                                        "/v3/api-docs.yaml",
                                                        "/swagger-ui/**",
                                                        "/swagger-ui.html",
                                                        "/swagger-resources/**",
                                                        "/webjars/**",
                                                        "/api-docs/**").permitAll();

                                        // SPA routes - expanded to match main config
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

                                        auth.anyRequest().authenticated();
                                })
                                // Add the corsFilter and JWT filter in the correct order
                                .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}