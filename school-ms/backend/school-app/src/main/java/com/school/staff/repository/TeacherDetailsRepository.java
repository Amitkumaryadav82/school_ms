package com.school.staff.repository;

import com.school.staff.model.TeacherDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for TeacherDetails entity.
 * This is a consolidated version migrated from com.example.schoolms.repository.TeacherDetailsRepository
 * 
 * @deprecated Use com.school.core.repository.TeacherDetailsRepository instead.
 */
@Repository("schoolTeacherDetailsRepository")
@Deprecated
public interface TeacherDetailsRepository extends JpaRepository<TeacherDetails, Long> {
    
    @Query("SELECT t FROM StaffModuleTeacherDetails t")
    java.util.List<TeacherDetails> findAllTeacherDetails();
}
