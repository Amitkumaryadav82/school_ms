package com.school.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Legacy database seeding via a CommandLineRunner has been replaced by Flyway
 * migration scripts located under db/migration. This configuration is kept
 * only for non-production profiles in case ad-hoc seeding is needed during
 * development. In production this bean is not loaded.
 */
@Configuration
@Profile("dev")
public class DatabaseSeedConfig {
    // Intentionally left blank. Flyway handles schema and seed data.
}
