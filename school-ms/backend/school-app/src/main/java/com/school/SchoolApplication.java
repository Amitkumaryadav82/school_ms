package com.school;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Main entry point for the School Management System.
 * This application is designed as a monolithic architecture where all modules
 * are packaged together and deployed as a single unit.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
@ComponentScan(basePackages = { "com.school" })
@EntityScan(basePackages = { "com.school" })
@EnableJpaRepositories(basePackages = { "com.school" })
@OpenAPIDefinition(info = @Info(title = "School Management System API", version = "1.0", description = "Unified School Management System API Documentation"))
public class SchoolApplication {

    // Logger retained in case future startup logging is needed
    private static final Logger log = LoggerFactory.getLogger(SchoolApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(SchoolApplication.class, args);
    }

    // Legacy StaffMigrationService removed; migration logic completed and disabled.
}