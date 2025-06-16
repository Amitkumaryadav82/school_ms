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

import com.school.core.service.StaffMigrationService;

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

    private static final Logger log = LoggerFactory.getLogger(SchoolApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(SchoolApplication.class, args);
    }
    
    /**
     * CommandLineRunner that triggers staff data migration when the application starts.
     * This can be enabled/disabled using the property 'staff.migration.enabled'.
     */
    @Bean
    public CommandLineRunner migrateStaffData(
            StaffMigrationService staffMigrationService,
            Environment environment) {
        return args -> {
            // Check if the migration should be performed
            String enableMigration = environment.getProperty("staff.migration.enabled", "false");
            if (Boolean.parseBoolean(enableMigration)) {
                log.info("Starting staff data migration...");
                try {
                    int migratedCount = staffMigrationService.migrateAllStaffData();
                    log.info("Staff data migration completed. Migrated {} records.", migratedCount);
                } catch (Exception e) {
                    log.error("Error during staff data migration: {}", e.getMessage(), e);
                }
            } else {
                log.info("Staff data migration is disabled. Set 'staff.migration.enabled=true' to enable it.");
                log.info("Current migration status: {}", staffMigrationService.getMigrationStatus());
            }
        };
    }
}