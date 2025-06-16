package com.school.staff.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.school.staff.model.Staff;

/**
 * Repository interface for Staff entity.
 * This is a consolidated version migrated from com.example.schoolms.repository.StaffRepository
 */
@Repository("schoolStaffRepository")
public interface StaffRepository extends JpaRepository<Staff, Long> {

    @Query("SELECT s FROM StaffModule s WHERE s.role = ?1")
    List<Staff> findByRole(String role);

    @Query("SELECT s FROM StaffModule s WHERE s.active = ?1")
    List<Staff> findByActive(boolean active);

    @Query("SELECT s FROM StaffModule s WHERE s.staffId = ?1")
    Optional<Staff> findByStaffId(String staffId);

    @Query("SELECT s FROM StaffModule s WHERE s.email = ?1")
    Optional<Staff> findByEmail(String email);
}
