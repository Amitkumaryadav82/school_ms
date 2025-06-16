package com.example.schoolms.repository;

import com.example.schoolms.model.TeacherDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * @deprecated Use com.school.core.repository.TeacherDetailsRepository instead.
 */
@Repository("exampleTeacherDetailsRepository")
@Deprecated
public interface TeacherDetailsRepository extends JpaRepository<TeacherDetails, Long> {
    
    @Query("SELECT t FROM ExampleTeacherDetails t")
    java.util.List<TeacherDetails> findAllTeacherDetails();
}