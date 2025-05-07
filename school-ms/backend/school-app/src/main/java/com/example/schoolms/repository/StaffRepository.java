package com.example.schoolms.repository;

import com.example.schoolms.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByRole(String role);

    List<Staff> findByIsActive(boolean isActive);

    Optional<Staff> findByEmail(String email);

    Optional<Staff> findByStaffId(String staffId);
}