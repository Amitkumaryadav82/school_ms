package com.school.hrm.service;

import com.school.hrm.model.Employee;
import com.school.hrm.model.EmployeeRole;
import com.school.hrm.model.EmploymentStatus;
import com.school.hrm.repository.EmployeeRepository;
import com.school.hrm.dto.EmployeeDTO;
import com.school.hrm.exception.EmployeeNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepository employeeRepository;

    public EmployeeDTO createEmployee(EmployeeDTO employeeDTO) {
        if (employeeRepository.existsByEmail(employeeDTO.getEmail())) {
            throw new IllegalArgumentException("Employee with email " + employeeDTO.getEmail() + " already exists");
        }

        Employee employee = Employee.builder()
                .firstName(employeeDTO.getFirstName())
                .lastName(employeeDTO.getLastName())
                .email(employeeDTO.getEmail())
                .phoneNumber(employeeDTO.getPhoneNumber())
                .role(employeeDTO.getRole())
                .department(employeeDTO.getDepartment())
                .joiningDate(employeeDTO.getJoiningDate())
                .status(employeeDTO.getStatus())
                .salary(employeeDTO.getSalary())
                .build();

        Employee savedEmployee = employeeRepository.save(employee);
        return convertToDTO(savedEmployee);
    }

    public EmployeeDTO updateEmployee(Long id, EmployeeDTO employeeDTO) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));

        employee.setFirstName(employeeDTO.getFirstName());
        employee.setLastName(employeeDTO.getLastName());
        employee.setPhoneNumber(employeeDTO.getPhoneNumber());
        employee.setRole(employeeDTO.getRole());
        employee.setDepartment(employeeDTO.getDepartment());
        employee.setStatus(employeeDTO.getStatus());
        employee.setSalary(employeeDTO.getSalary());

        if (employeeDTO.getTerminationDate() != null) {
            employee.setTerminationDate(employeeDTO.getTerminationDate());
            employee.setStatus(EmploymentStatus.TERMINATED);
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return convertToDTO(updatedEmployee);
    }

    public EmployeeDTO updateEmployeeStatus(Long id, EmploymentStatus status) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));

        employee.setStatus(status);

        // Handle special cases for certain statuses
        if (status == EmploymentStatus.RESIGNED || status == EmploymentStatus.TERMINATED) {
            if (employee.getTerminationDate() == null) {
                employee.setTerminationDate(java.time.LocalDate.now());
            }
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return convertToDTO(updatedEmployee);
    }

    public EmployeeDTO getEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
        return convertToDTO(employee);
    }

    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EmployeeDTO> getEmployeesByDepartment(String department) {
        return employeeRepository.findByDepartment(department).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EmployeeDTO> getEmployeesByRole(EmployeeRole role) {
        return employeeRepository.findByRole(role).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new EmployeeNotFoundException(id);
        }
        employeeRepository.deleteById(id);
    }

    private EmployeeDTO convertToDTO(Employee employee) {
        return EmployeeDTO.builder()
                .id(employee.getId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .phoneNumber(employee.getPhoneNumber())
                .role(employee.getRole())
                .department(employee.getDepartment())
                .joiningDate(employee.getJoiningDate())
                .terminationDate(employee.getTerminationDate())
                .status(employee.getStatus())
                .salary(employee.getSalary())
                .build();
    }
}