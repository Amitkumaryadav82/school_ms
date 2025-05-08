package com.school;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.ComponentScan;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

/**
 * Main entry point for the School Management System.
 * This application is designed as a monolithic architecture where all modules
 * are packaged together and deployed as a single unit.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
@ComponentScan(basePackages = {"com.school", "com.example.schoolms"})
// Explicitly define entity scanning to prevent conflicts
@EntityScan(basePackageClasses = {
    com.school.SchoolApplication.class,
    com.example.schoolms.model.Staff.class
})
// Explicitly define repository scanning
@EnableJpaRepositories(basePackages = {"com.school", "com.example.schoolms"})
@OpenAPIDefinition(info = @Info(title = "School Management System API", version = "1.0", description = "Unified School Management System API Documentation"))
public class SchoolApplication {

    public static void main(String[] args) {
        SpringApplication.run(SchoolApplication.class, args);
    }
}