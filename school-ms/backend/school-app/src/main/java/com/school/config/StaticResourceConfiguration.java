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
public class StaticResourceConfiguration {    @Bean
    public SecurityFilterChain staticResourceFilterChain(HttpSecurity http) throws Exception {
        http
                .requestMatchers()
                    .antMatchers(
                        "/assets/**",
                        "/static/**",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/*.js",
                        "/*.css",
                        "/*.ico",
                        "/*.png",                        "/favicon.ico",
                        "/index.html",
                        "/manifest.json",
                        "/robots.txt",
                        "/test.html")                .and()
                .authorizeRequests()
                        .anyRequest().permitAll()
                .and()
                .requestCache().disable()
                .securityContext().disable()
                .sessionManagement().disable()
                .csrf().disable();

        return http.build();
    }
}