package com.school.hrm.config;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.school.hrm.entity.StaffRole;
import com.school.hrm.repository.StaffRoleRepository;

@Component
public class StaffRoleInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(StaffRoleInitializer.class);

    private final StaffRoleRepository staffRoleRepository;

    @Autowired
    public StaffRoleInitializer(StaffRoleRepository staffRoleRepository) {
        this.staffRoleRepository = staffRoleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing staff roles");

        // Define the required roles
        List<StaffRole> requiredRoles = Arrays.asList(
                createRole("Principal", "School head responsible for overall management"),
                createRole("Admin Officer", "Handles administrative tasks"),
                createRole("Management", "Responsible for school operations and management"),
                createRole("Account Officer", "Manages school finances and accounts"),
                createRole("Librarian", "Manages library resources"),
                createRole("Teacher", "Responsible for teaching and student development"));

        // Ensure each role exists
        for (StaffRole role : requiredRoles) {
            ensureRoleExists(role);
        }

        logger.info("Staff role initialization completed");
    }

    private void ensureRoleExists(StaffRole role) {
        String roleName = role.getRoleName();
        Optional<StaffRole> existingRole = staffRoleRepository.findByRoleName(roleName);

        if (existingRole.isEmpty()) {
            logger.info("Creating staff role: {}", roleName);
            staffRoleRepository.save(role);
        } else {
            logger.debug("Staff role already exists: {}", roleName);
        }
    }

    private StaffRole createRole(String name, String description) {
        LocalDateTime now = LocalDateTime.now();
        return StaffRole.builder()
                .roleName(name)
                .description(description)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }
}