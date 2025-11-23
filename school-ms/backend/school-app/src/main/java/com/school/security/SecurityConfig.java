package com.school.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
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
        private final Environment environment;

        public SecurityConfig(CorsFilter corsFilter, UserDetailsService userDetailsService,
                        JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                        Environment environment) {
                // Inject the corsFilter from CorsConfig
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
         * Main security filter chain for the monolithic application.
         * Handles both static resources and API endpoints in a single configuration.
         */
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                boolean isDev = java.util.Arrays.asList(environment.getActiveProfiles()).contains("dev");
                http
                                // Security headers configuration
                                .headers(headers -> headers
                                                .frameOptions(frame -> {
                                                        if (isDev)
                                                                frame.disable();
                                                        else
                                                                frame.sameOrigin();
                                                })
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
                                                .authenticationEntryPoint(jwtAuthenticationEntryPoint))
                                // Configure authorization rules
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
                                                        "/*.svg",
                                                        "/favicon.svg",
                                                        "/assets/**",
                                                        "/static/**",
                                                        "/css/**",
                                                        "/js/**",
                                                        "/images/**",
                                                        "/favicon.ico",
                                                        "/manifest.json",
                                                        "/robots.txt").permitAll(); // Auth endpoints - explicitly list
                                                                                    // all public endpoints for clarity
                                        auth.antMatchers(
                                                        "/api/auth/login",
                                                        "/api/auth/register",
                                                        "/api/auth/health",
                                                        "/api/auth/refresh",
                                                        "/api/auth/validate-token").permitAll();

                                        auth.antMatchers("/h2-console/**").permitAll();
                                        // Only health open; secure other actuator endpoints
                                        auth.antMatchers("/actuator/health").permitAll();
                                        auth.antMatchers("/actuator/**").authenticated(); // IMPORTANT: Override the
                                                                                          // method-level security for
                                                                                          // fee report endpoints
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
                                                        "/api-docs/**").permitAll(); // SPA frontend routes
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
}