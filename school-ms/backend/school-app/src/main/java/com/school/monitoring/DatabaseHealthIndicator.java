package com.school.monitoring;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Custom health indicator that checks database connectivity
 * and reports detailed health information for operations monitoring.
 */
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public DatabaseHealthIndicator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Health health() {
        try {
            // Execute a simple test query
            int result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            if (result == 1) {
                // Get additional database metrics to include in health info
                Integer activeConnections = jdbcTemplate.queryForObject(
                        "SELECT count(*) FROM pg_stat_activity", Integer.class);

                return Health.up()
                        .withDetail("database", "PostgreSQL")
                        .withDetail("activeConnections", activeConnections)
                        .withDetail("status", "Operational")
                        .build();
            } else {
                return Health.down()
                        .withDetail("error", "Database health check failed")
                        .build();
            }
        } catch (Exception e) {
            return Health.down()
                    .withDetail("error", "Database connection failed")
                    .withDetail("message", e.getMessage())
                    .build();
        }
    }
}