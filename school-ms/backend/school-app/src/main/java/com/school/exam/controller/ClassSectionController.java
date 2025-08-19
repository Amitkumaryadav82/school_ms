package com.school.exam.controller;

import com.school.exam.model.SchoolClass;
import com.school.exam.repository.SchoolClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class ClassSectionController {

    @Autowired
    private SchoolClassRepository classRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Removed duplicate /api/classes GET mapping to avoid conflict with ExamConfigController#getAllClasses

    @GetMapping("/{classId}/sections")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public List<String> getSectionsForClass(@PathVariable Long classId) {
        SchoolClass clazz = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + classId));

        // Derive grade number from class name if possible (e.g., "Class 5" -> 5)
        Integer gradeNumber = extractGradeNumber(clazz.getName());
        if (gradeNumber == null) {
            throw new IllegalStateException("Unable to derive grade number from class name: " + clazz.getName());
        }

        // Query sections mapped for this grade from class_sections -> sections
        String sql = "SELECT s.section_name FROM class_sections cs " +
                "JOIN grade_levels gl ON cs.grade_id = gl.id " +
                "JOIN sections s ON cs.section_id = s.id " +
                "WHERE gl.grade_number = ? ORDER BY s.section_name";

        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("section_name"), gradeNumber);
    }

    private Integer extractGradeNumber(String className) {
        if (className == null)
            return null;
        // Expect formats like "Class 1", "Grade 10", or just a number
        String normalized = className.trim().toLowerCase();
        normalized = normalized.replace("class", "").replace("grade", "").trim();
        try {
            return Integer.parseInt(normalized);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
