package com.school.hrm.repository;

import com.school.hrm.model.Employee;
import com.school.hrm.model.EmployeeRole;
import com.school.hrm.model.EmploymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);

    List<Employee> findByDepartment(String department);

    List<Employee> findByRole(EmployeeRole role);

    List<Employee> findByStatus(EmploymentStatus status);

    List<Employee> findByDepartmentAndRole(String department, EmployeeRole role);

    boolean existsByEmail(String email);
}