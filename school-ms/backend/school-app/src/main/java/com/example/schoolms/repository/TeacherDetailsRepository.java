package com.example.schoolms.repository;

import com.example.schoolms.model.TeacherDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeacherDetailsRepository extends JpaRepository<TeacherDetails, Long> {
}