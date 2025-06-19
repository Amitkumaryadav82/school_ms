package com.school.core.repository;

import com.school.core.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Employee entity.
 * Migrated from com.school.hrm.repository.EmployeeRepository
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // Add any custom queries if needed
}
