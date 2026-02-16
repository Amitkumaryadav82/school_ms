package com.school.timetable.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timetable/requirements")
public class TimetableRequirementsController {

    private final JdbcTemplate jdbc;

    @Autowired
    public TimetableRequirementsController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record RequirementRequest(
            Long classId,
            String section,
            Long subjectId,
            Integer weeklyPeriods,
            String notes) {
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL','STAFF')")
    public ResponseEntity<List<Map<String, Object>>> getRequirements(
            @RequestParam Long classId,
            @RequestParam String section) {

        // Resolve section ID
        Long sectionId = resolveSectionIdIfNeeded(classId, section);
        if (sectionId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Fetch requirements with subject details
        List<Map<String, Object>> requirements = jdbc.queryForList(
                "SELECT tr.id, tr.class_id as \"classId\", tr.section_id as \"sectionId\", " +
                        "tr.subject_id as \"subjectId\", tr.weekly_periods as \"weeklyPeriods\", " +
                        "tr.notes, s.code as \"subjectCode\", s.name as \"subjectName\" " +
                        "FROM timetable_requirements tr " +
                        "JOIN subjects s ON s.id = tr.subject_id " +
                        "WHERE tr.class_id = ? AND tr.section_id = ? " +
                        "ORDER BY s.name",
                classId, sectionId);

        return ResponseEntity.ok(requirements);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<Map<String, Object>> createRequirement(@RequestBody RequirementRequest req) {
        if (req.classId() == null || req.section() == null || req.subjectId() == null || req.weeklyPeriods() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Resolve section ID
        Long sectionId = resolveSectionIdIfNeeded(req.classId(), req.section());
        if (sectionId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Check if requirement already exists
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM timetable_requirements WHERE class_id = ? AND section_id = ? AND subject_id = ?",
                Integer.class, req.classId(), sectionId, req.subjectId());

        if (count != null && count > 0) {
            return ResponseEntity.status(409).build(); // Conflict
        }

        // Insert requirement
        jdbc.update(
                "INSERT INTO timetable_requirements (class_id, section_id, subject_id, weekly_periods, notes) VALUES (?, ?, ?, ?, ?)",
                req.classId(), sectionId, req.subjectId(), req.weeklyPeriods(), req.notes());

        // Fetch the created requirement
        Map<String, Object> created = jdbc.queryForMap(
                "SELECT tr.id, tr.class_id as \"classId\", tr.section_id as \"sectionId\", " +
                        "tr.subject_id as \"subjectId\", tr.weekly_periods as \"weeklyPeriods\", " +
                        "tr.notes, s.code as \"subjectCode\", s.name as \"subjectName\" " +
                        "FROM timetable_requirements tr " +
                        "JOIN subjects s ON s.id = tr.subject_id " +
                        "WHERE tr.class_id = ? AND tr.section_id = ? AND tr.subject_id = ?",
                req.classId(), sectionId, req.subjectId());

        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<Map<String, Object>> updateRequirement(
            @PathVariable Long id,
            @RequestBody RequirementRequest req) {

        if (req.weeklyPeriods() == null || req.weeklyPeriods() < 1) {
            return ResponseEntity.badRequest().build();
        }

        // Update requirement
        int updated = jdbc.update(
                "UPDATE timetable_requirements SET weekly_periods = ?, notes = ? WHERE id = ?",
                req.weeklyPeriods(), req.notes(), id);

        if (updated == 0) {
            return ResponseEntity.notFound().build();
        }

        // Fetch the updated requirement
        Map<String, Object> result = jdbc.queryForMap(
                "SELECT tr.id, tr.class_id as \"classId\", tr.section_id as \"sectionId\", " +
                        "tr.subject_id as \"subjectId\", tr.weekly_periods as \"weeklyPeriods\", " +
                        "tr.notes, s.code as \"subjectCode\", s.name as \"subjectName\" " +
                        "FROM timetable_requirements tr " +
                        "JOIN subjects s ON s.id = tr.subject_id " +
                        "WHERE tr.id = ?",
                id);

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<Void> deleteRequirement(@PathVariable Long id) {
        int deleted = jdbc.update("DELETE FROM timetable_requirements WHERE id = ?", id);

        if (deleted == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    private Long resolveSectionIdIfNeeded(Long classId, String section) {
        // If 'section' is numeric, assume it's the sectionId already; else try to derive from grade and name
        try {
            return Long.parseLong(section);
        } catch (NumberFormatException ignore) {
        }

        // Derive section id via grade levels and sections tables using class name
        String className = jdbc.queryForObject("SELECT name FROM classes WHERE id=?", String.class, classId);
        Integer grade = extractGradeNumber(className);
        if (grade == null)
            return null;

        String sql = "SELECT s.id FROM class_sections cs " +
                "JOIN grade_levels gl ON cs.grade_id=gl.id " +
                "JOIN sections s ON cs.section_id = s.id " +
                "WHERE gl.grade_number=? AND s.section_name=?";

        try {
            return jdbc.queryForObject(sql, Long.class, grade, section);
        } catch (Exception e) {
            return null;
        }
    }

    private Integer extractGradeNumber(String className) {
        if (className == null)
            return null;
        String normalized = className.trim().toLowerCase();
        normalized = normalized.replace("class", "").replace("grade", "").trim();
        try {
            return Integer.parseInt(normalized);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
