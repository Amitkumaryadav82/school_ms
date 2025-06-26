package com.school.security;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Configuration for Authentication Controller to ensure it uses the standard ObjectMapper
 * instead of the enhanced one with circular reference handling.
 */
@Configuration
public class AuthControllerConfig implements WebMvcConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(AuthControllerConfig.class);

    /**
     * Create a specialized HTTP message converter for Auth endpoints
     * This will use the standard object mapper without circular reference handling
     * 
     * @param standardMapper the standard ObjectMapper
     * @return a configured MappingJackson2HttpMessageConverter with highest precedence
     */
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 1)
    public MappingJackson2HttpMessageConverter authHttpMessageConverter(
            @Qualifier("standardObjectMapper") ObjectMapper standardMapper) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(standardMapper);
        logger.info("Created specialized HTTP message converter for Auth endpoints");
        return converter;
    }
}
