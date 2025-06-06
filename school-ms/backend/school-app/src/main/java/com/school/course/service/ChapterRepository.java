package com.school.course.service;

import com.school.course.model.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findBySubject(String subject);
    
    List<Chapter> findByGrade(Integer grade);
    
    List<Chapter> findBySubjectAndGrade(String subject, Integer grade);
    
    List<Chapter> findByIsActive(Boolean isActive);
    
    Chapter findByName(String name);
}
