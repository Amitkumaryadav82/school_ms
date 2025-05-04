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

    public SecurityConfig(CorsFilter corsFilter, UserDetailsService userDetailsService) {
        this.corsFilter = corsFilter;
        this.userDetailsService = userDetailsService;
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
                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)))

                // Disable CSRF for REST APIs and static resources
                .csrf(AbstractHttpConfigurer::disable)

                // Apply CORS configuration - properly enable CORS
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                    corsConfiguration.setAllowedOrigins(java.util.Arrays.asList("http://localhost:5173",
                            "http://localhost:8080", "http://localhost:3000"));
                    corsConfiguration.setAllowedMethods(
                            java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                    corsConfiguration.setAllowedHeaders(java.util.Arrays.asList("Authorization", "Content-Type",
                            "Accept", "Origin", "X-Requested-With", "Access-Control-Request-Method",
                            "Access-Control-Request-Headers"));
                    corsConfiguration.setAllowCredentials(true);
                    corsConfiguration.setMaxAge(3600L);
                    return corsConfiguration;
                }))

                // Use stateless sessions for API calls
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configure authorization rules
                .authorizeHttpRequests(auth -> {
                    // First, explicitly permit all static resources with very specific patterns
                    auth.requestMatchers(
                            AntPathRequestMatcher.antMatcher("/"),
                            AntPathRequestMatcher.antMatcher("/index.html"),
                            AntPathRequestMatcher.antMatcher("/*.js"),
                            AntPathRequestMatcher.antMatcher("/*.css"),
                            AntPathRequestMatcher.antMatcher("/*.json"),
                            AntPathRequestMatcher.antMatcher("/*.ico"),
                            AntPathRequestMatcher.antMatcher("/*.png"),
                            AntPathRequestMatcher.antMatcher("/assets/**"),
                            AntPathRequestMatcher.antMatcher("/static/**"),
                            AntPathRequestMatcher.antMatcher("/css/**"),
                            AntPathRequestMatcher.antMatcher("/js/**"),
                            AntPathRequestMatcher.antMatcher("/images/**"),
                            AntPathRequestMatcher.antMatcher("/favicon.ico"),
                            AntPathRequestMatcher.antMatcher("/manifest.json"),
                            AntPathRequestMatcher.antMatcher("/robots.txt")).permitAll();

                    // Authentication endpoints
                    auth.requestMatchers("/api/auth/**", "/api/auth/login", "/api/auth/register").permitAll();

                    // Swagger/OpenAPI documentation
                    auth.requestMatchers(
                            "/v3/api-docs/**",
                            "/v3/api-docs.yaml",
                            "/swagger-ui/**",
                            "/swagger-ui.html",
                            "/swagger-resources/**",
                            "/webjars/**",
                            "/api-docs/**").permitAll();

                    // SPA frontend routes
                    auth.requestMatchers(
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

                    // All other API requests require authentication
                    auth.anyRequest().authenticated();
                })

                // Add filters
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
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                    corsConfiguration.setAllowedOrigins(java.util.Arrays.asList("http://localhost:5173",
                            "http://localhost:8080", "http://localhost:3000"));
                    corsConfiguration.setAllowedMethods(
                            java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                    corsConfiguration.setAllowedHeaders(java.util.Arrays.asList("Authorization", "Content-Type",
                            "Accept", "Origin", "X-Requested-With", "Access-Control-Request-Method",
                            "Access-Control-Request-Headers"));
                    corsConfiguration.setAllowCredentials(true);
                    corsConfiguration.setMaxAge(3600L);
                    return corsConfiguration;
                }))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    // All static resources
                    auth.requestMatchers(AntPathRequestMatcher.antMatcher("/**/*.js"),
                            AntPathRequestMatcher.antMatcher("/**/*.css"),
                            AntPathRequestMatcher.antMatcher("/**/*.html"),
                            AntPathRequestMatcher.antMatcher("/**/*.json"),
                            AntPathRequestMatcher.antMatcher("/**/*.ico"),
                            AntPathRequestMatcher.antMatcher("/**/*.png"),
                            AntPathRequestMatcher.antMatcher("/"),
                            AntPathRequestMatcher.antMatcher("/index.html"),
                            AntPathRequestMatcher.antMatcher("/static/**"),
                            AntPathRequestMatcher.antMatcher("/assets/**")).permitAll();

                    // Allow access to H2 console in dev mode
                    auth.requestMatchers("/h2-console/**").permitAll();
                    auth.requestMatchers("/actuator/**").permitAll();

                    // Auth endpoints
                    auth.requestMatchers("/api/auth/**").permitAll();

                    // API docs
                    auth.requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll();

                    // SPA routes
                    auth.requestMatchers("/login", "/register", "/dashboard", "/admin").permitAll();

                    auth.anyRequest().authenticated();
                })
                .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}