package com.school.core.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.school.core.model.TeacherDetails;

/**
 * Repository for accessing teacher details data from the database.
 * This is the consolidated repository that replaces both:
 * - com.school.staff.repository.TeacherDetailsRepository
 * - com.example.schoolms.repository.TeacherDetailsRepository
 */
@Repository
public interface TeacherDetailsRepository extends JpaRepository<TeacherDetails, Long> {
    
    /**
     * Find teacher details by staff ID
     * 
     * @param staffId The staff ID associated with the teacher details
     * @return Optional containing the teacher details if found
     */
    Optional<TeacherDetails> findByStaffStaffId(String staffId);
    
    /**
     * Find teacher details by department
     * 
     * @param department The department to search for
     * @return List of teacher details in the specified department
     */
    List<TeacherDetails> findByDepartment(String department);
    
    /**
     * Find teacher details by years of experience greater than or equal to the specified value
     * 
     * @param years Minimum years of experience
     * @return List of teacher details with the specified minimum experience
     */
    List<TeacherDetails> findByYearsOfExperienceGreaterThanEqual(Integer years);
}
