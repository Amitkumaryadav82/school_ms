package com.example.schoolms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.schoolms.model.Staff;

@Repository("exampleStaffRepository")
public interface StaffRepository extends JpaRepository<Staff, Long> {

    @Query("SELECT s FROM ExampleStaff s WHERE s.role = ?1")
    List<Staff> findByRole(String role);

    @Query("SELECT s FROM ExampleStaff s WHERE s.active = ?1")
    List<Staff> findByIsActive(boolean active);

    @Query("SELECT s FROM ExampleStaff s WHERE s.staffId = ?1")
    Optional<Staff> findByStaffId(String staffId);

    @Query("SELECT s FROM ExampleStaff s WHERE s.email = ?1")
    Optional<Staff> findByEmail(String email);
}