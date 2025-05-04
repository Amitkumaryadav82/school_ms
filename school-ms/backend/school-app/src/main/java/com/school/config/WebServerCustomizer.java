package com.school.config;

import org.springframework.boot.web.server.MimeMappings;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Configuration;

/**
 * Customizer for configuring proper MIME types for modern web assets.
 * This ensures JavaScript modules and other assets are served with the correct
 * Content-Type headers.
 */
@Configuration
public class WebServerCustomizer implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {

    @Override
    public void customize(ConfigurableServletWebServerFactory factory) {
        MimeMappings mappings = new MimeMappings(MimeMappings.DEFAULT);

        // Ensure JavaScript files are served with the correct MIME type
        mappings.add("js", "application/javascript");
        mappings.add("mjs", "application/javascript");

        // CSS files
        mappings.add("css", "text/css");

        // JSON files
        mappings.add("json", "application/json");

        // Image files
        mappings.add("png", "image/png");
        mappings.add("ico", "image/x-icon");
        mappings.add("svg", "image/svg+xml");

        // Apply the custom MIME mappings
        factory.setMimeMappings(mappings);
    }
}