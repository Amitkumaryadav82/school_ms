package com.school.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebMvc configuration for serving static resources and CORS.
 * This ensures resources like CSS, JS, and images are properly served.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

        @Value("${cors.allowed-origins:http://localhost:8080,http://localhost:5173,http://localhost:5174,http://localhost:3000}")
        private String allowedOriginsStr;

        @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS,PATCH}")
        private String allowedMethodsStr;

        @Value("${cors.max-age:3600}")
        private long maxAge;

        @Override
        public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                                .allowedOrigins(allowedOriginsStr.split(","))
                                .allowedMethods(allowedMethodsStr.split(","))
                                .allowedHeaders("*")
                                .allowCredentials(true)
                                .maxAge(maxAge);

                System.out.println("CORS WebMvc configuration applied");
        }

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // Make sure to map all static resources correctly
                registry.addResourceHandler("/**")
                                .addResourceLocations("classpath:/static/")
                                .setCachePeriod(3600);

                // Explicitly map common file types
                registry.addResourceHandler("/*.js")
                                .addResourceLocations("classpath:/static/")
                                .setCachePeriod(3600);

                registry.addResourceHandler("/*.css")
                                .addResourceLocations("classpath:/static/")
                                .setCachePeriod(3600);

                registry.addResourceHandler("/*.ico")
                                .addResourceLocations("classpath:/static/")
                                .setCachePeriod(3600);

                // Add mapping for assets folder
                registry.addResourceHandler("/assets/**")
                                .addResourceLocations("classpath:/static/assets/")
                                .setCachePeriod(3600);
        }
}