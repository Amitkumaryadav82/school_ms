package com.school.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.beans.factory.annotation.Qualifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Enhanced configuration class for Jackson JSON serialization/deserialization.
 * This configuration helps prevent circular reference issues and ensures
 * proper serialization of Java 8 date/time types.
 */
@Configuration
public class JacksonConfig {
    private static final Logger logger = LoggerFactory.getLogger(JacksonConfig.class);

    /**
     * Configure a standard ObjectMapper for general use
     * 
     * @return a configured ObjectMapper with basic settings
     */
    @Bean("standardObjectMapper")
    public ObjectMapper standardObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Register the JavaTimeModule to handle Java 8 date/time types
        mapper.registerModule(new JavaTimeModule());
        
        // Configure to handle Java 8 date/time types
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        
        // Set default behavior to ignore unknown properties
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        
        logger.info("Created standard ObjectMapper");
        return mapper;
    }

    /**
     * Configure an enhanced ObjectMapper specifically for handling circular references
     * in the Staff and TeacherDetails entities
     * 
     * @return a configured ObjectMapper with advanced circular reference handling
     */
    @Bean("enhancedObjectMapper")
    public ObjectMapper enhancedObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Register the JavaTimeModule to handle Java 8 date/time types
        mapper.registerModule(new JavaTimeModule());
        
        // Configure to handle circular references and Java 8 date/time types
        mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        
        // Enable feature to prevent circular references
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
        
        // Set default behavior to ignore unknown properties
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        
        // Field visibility settings
        mapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);
        
        // Only include non-null values to reduce payload size
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        
        // Enable circular reference detection
        mapper.configure(SerializationFeature.WRITE_SELF_REFERENCES_AS_NULL, true);
        
        logger.info("Created enhanced ObjectMapper for circular reference handling");
        return mapper;
    }
    
    /**
     * Configure the primary ObjectMapper used by Spring
     * This is the default mapper that most services will use
     * 
     * @param builder the Jackson2ObjectMapperBuilder provided by Spring
     * @return a configured ObjectMapper
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        return standardObjectMapper();
    }

    /**
     * Create a specialized HTTP message converter for Staff endpoints
     * This will use the enhanced object mapper for Staff and TeacherDetails entities
     * 
     * @param enhancedMapper the enhanced ObjectMapper with circular reference handling
     * @return a configured MappingJackson2HttpMessageConverter
     */
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public MappingJackson2HttpMessageConverter staffHttpMessageConverter(
            @Qualifier("enhancedObjectMapper") ObjectMapper enhancedMapper) {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(enhancedMapper);
        logger.info("Created specialized HTTP message converter for Staff endpoints");
        return converter;
    }
}
