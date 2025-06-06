package com.school.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

/**
 * WebSecurity configuration to handle CORS preflight requests.
 * This ensures OPTIONS requests can bypass the security filter chain.
 */
@Configuration
@Order(1)
public class WebSecurityConfig {

    /**
     * This customizer ensures that OPTIONS preflight requests bypass Spring
     * Security entirely.
     * This is needed because preflight requests don't include authentication
     * credentials.
     */    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
                .antMatchers(HttpMethod.OPTIONS, "/**");
    }
}
