package com.school.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Configuration
public class DatabaseSeedConfig implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Attempt to detect if sections/grade_levels exist; if not, run seed script.
        // Also skip if running against H2 (script is PostgreSQL-specific).
        String url = dataSource.getConnection().getMetaData().getURL();
        boolean isPostgres = url != null && url.toLowerCase().contains(":postgresql:");
        if (!isPostgres) {
            return; // Skip seeding for non-PostgreSQL databases
        }

        // Check if grade_levels table exists
        boolean gradeLevelsExists = tableExists("grade_levels");
        boolean sectionsExists = tableExists("sections");

        if (gradeLevelsExists && sectionsExists) {
            // Already initialized (or previously migrated). Nothing to do.
            return;
        }

        // Execute the seed script
        try (Connection connection = dataSource.getConnection()) {
            ScriptUtils.executeSqlScript(connection,
                    new ClassPathResource("db/seed/insert_grades_sections.sql"));
        } catch (SQLException e) {
            throw new RuntimeException("Failed to execute seed script for grades/sections", e);
        }
    }

    private boolean tableExists(String tableName) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?",
                    Integer.class, tableName);
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }
}
