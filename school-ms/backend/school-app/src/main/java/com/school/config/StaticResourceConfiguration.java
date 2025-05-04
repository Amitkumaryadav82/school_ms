package com.school.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuration specifically for allowing access to static resources.
 * Using @Order(1) to ensure this filter chain is processed before the main
 * security chain.
 */
@Configuration
@EnableWebSecurity
@Order(1)
public class StaticResourceConfiguration {

    @Bean
    public SecurityFilterChain staticResourceFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher(
                        "/assets/**",
                        "/static/**",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/*.js",
                        "/*.css",
                        "/*.ico",
                        "/*.png",
                        "/favicon.ico",
                        "/index.html",
                        "/manifest.json",
                        "/robots.txt",
                        "/test.html")
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll())
                .requestCache(cache -> cache.disable())
                .securityContext(context -> context.disable())
                .sessionManagement(session -> session.disable())
                .csrf(csrf -> csrf.disable());

        return http.build();
    }
}