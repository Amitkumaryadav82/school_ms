package com.school.timetable.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/timetable/substitutions")
public class TimetableSubstitutionsController {

    private final JdbcTemplate jdbc;

    @Autowired
    public TimetableSubstitutionsController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record SubstitutionRequest(
            LocalDate date,
            Long classId,
            String section,
            Integer periodNo,
            Long originalTeacherId,
            Long substituteTeacherId,
            String reason) {
    }

    public record SuggestedTeacher(
            Long id,
            String name,
            String department,
            Integer currentLoad,
            Integer maxLoad,
            boolean isOverloaded,
            String warningMessage) {
    }

    /**
     * Get all substitutions for a specific date
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL','STAFF')")
    public ResponseEntity<List<Map<String, Object>>> getSubstitutions(@RequestParam LocalDate date) {
        List<Map<String, Object>> substitutions = jdbc.queryForList(
                "SELECT ts.id, ts.date, ts.class_id as \"classId\", ts.section_id as \"sectionId\", " +
                        "ts.period_no as \"periodNo\", ts.original_teacher_details_id as \"originalTeacherId\", " +
                        "ts.substitute_teacher_details_id as \"substituteTeacherId\", ts.reason, " +
                        "ts.approved_by as \"approvedBy\", " +
                        "c.name as \"className\", s.section_name as \"sectionName\", " +
                        "subj.code as \"subjectCode\", subj.name as \"subjectName\", " +
                        "COALESCE(orig_staff.first_name || ' ' || orig_staff.last_name, 'Unknown') as \"originalTeacherName\", "
                        +
                        "COALESCE(sub_staff.first_name || ' ' || sub_staff.last_name, 'Unknown') as \"substituteTeacherName\" "
                        +
                        "FROM timetable_substitutions ts " +
                        "JOIN classes c ON c.id = ts.class_id " +
                        "LEFT JOIN sections s ON s.id = ts.section_id " +
                        "LEFT JOIN timetable_slots slot ON slot.class_id = ts.class_id AND slot.section_id = ts.section_id AND slot.period_no = ts.period_no "
                        +
                        "LEFT JOIN subjects subj ON subj.id = slot.subject_id " +
                        "LEFT JOIN teacher_details orig_td ON orig_td.id = ts.original_teacher_details_id " +
                        "LEFT JOIN school_staff orig_staff ON orig_staff.teacher_details_id = orig_td.id " +
                        "LEFT JOIN teacher_details sub_td ON sub_td.id = ts.substitute_teacher_details_id " +
                        "LEFT JOIN school_staff sub_staff ON sub_staff.teacher_details_id = sub_td.id " +
                        "WHERE ts.date = ? " +
                        "ORDER BY ts.class_id, ts.period_no",
                date);

        return ResponseEntity.ok(substitutions);
    }

    /**
     * Get classes that need substitution for a specific teacher on a date
     */
    @GetMapping("/needed")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL','STAFF')")
    public ResponseEntity<List<Map<String, Object>>> getClassesNeedingSubstitution(
            @RequestParam Long teacherId,
            @RequestParam LocalDate date) {

        // Get day of week (1=Monday, 7=Sunday)
        int dayOfWeek = date.getDayOfWeek().getValue();

        // Find all classes this teacher is scheduled to teach on this day
        List<Map<String, Object>> classes = jdbc.queryForList(
                "SELECT slot.id as \"slotId\", slot.class_id as \"classId\", slot.section_id as \"sectionId\", " +
                        "slot.period_no as \"periodNo\", slot.subject_id as \"subjectId\", " +
                        "c.name as \"className\", s.section_name as \"sectionName\", " +
                        "subj.code as \"subjectCode\", subj.name as \"subjectName\", " +
                        "CASE WHEN ts.id IS NOT NULL THEN true ELSE false END as \"hasSubstitute\" " +
                        "FROM timetable_slots slot " +
                        "JOIN classes c ON c.id = slot.class_id " +
                        "LEFT JOIN sections s ON s.id = slot.section_id " +
                        "LEFT JOIN subjects subj ON subj.id = slot.subject_id " +
                        "LEFT JOIN timetable_substitutions ts ON ts.date = ? AND ts.class_id = slot.class_id AND ts.section_id = slot.section_id AND ts.period_no = slot.period_no "
                        +
                        "WHERE slot.teacher_details_id = ? AND slot.day_of_week = ? " +
                        "ORDER BY slot.period_no",
                date, teacherId, dayOfWeek);

        return ResponseEntity.ok(classes);
    }

    /**
     * Suggest substitute teachers for a specific class/period
     * Prioritizes teachers with lighter workload but shows all available teachers
     */
    @GetMapping("/suggest")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL','STAFF')")
    public ResponseEntity<List<SuggestedTeacher>> suggestSubstitutes(
            @RequestParam Long classId,
            @RequestParam String section,
            @RequestParam Integer periodNo,
            @RequestParam LocalDate date,
            @RequestParam(required = false) Long subjectId) {

        int dayOfWeek = date.getDayOfWeek().getValue();
        Long sectionId = resolveSectionIdIfNeeded(classId, section);

        // Get max periods per teacher per day from settings (default 5)
        Integer maxPeriodsPerDay = jdbc.queryForObject(
                "SELECT COALESCE(max_periods_per_teacher_per_day, 5) FROM timetable_settings ORDER BY id LIMIT 1",
                Integer.class);
        if (maxPeriodsPerDay == null)
            maxPeriodsPerDay = 5;

        // Find all teachers who:
        // 1. Teach the subject (if specified)
        // 2. Are NOT teaching another class at this time
        // 3. Calculate their current load for this day

        String sql;
        Object[] params;

        if (subjectId != null) {
            // Filter by subject
            sql = "SELECT DISTINCT td.id, " +
                    "COALESCE(ss.first_name || ' ' || ss.last_name, 'Teacher #' || td.id) as name, " +
                    "ss.department, " +
                    "(SELECT COUNT(*) FROM timetable_slots WHERE teacher_details_id = td.id AND day_of_week = ?) as current_load "
                    +
                    "FROM teacher_details td " +
                    "JOIN teacher_subject_map tsm ON tsm.teacher_details_id = td.id " +
                    "LEFT JOIN school_staff ss ON ss.teacher_details_id = td.id " +
                    "WHERE tsm.subject_id = ? " +
                    "AND td.id NOT IN ( " +
                    "  SELECT teacher_details_id FROM timetable_slots " +
                    "  WHERE day_of_week = ? AND period_no = ? AND teacher_details_id IS NOT NULL " +
                    ") " +
                    "ORDER BY current_load, name";
            params = new Object[] { dayOfWeek, subjectId, dayOfWeek, periodNo };
        } else {
            // All available teachers
            sql = "SELECT DISTINCT td.id, " +
                    "COALESCE(ss.first_name || ' ' || ss.last_name, 'Teacher #' || td.id) as name, " +
                    "ss.department, " +
                    "(SELECT COUNT(*) FROM timetable_slots WHERE teacher_details_id = td.id AND day_of_week = ?) as current_load "
                    +
                    "FROM teacher_details td " +
                    "LEFT JOIN school_staff ss ON ss.teacher_details_id = td.id " +
                    "WHERE td.id NOT IN ( " +
                    "  SELECT teacher_details_id FROM timetable_slots " +
                    "  WHERE day_of_week = ? AND period_no = ? AND teacher_details_id IS NOT NULL " +
                    ") " +
                    "ORDER BY current_load, name";
            params = new Object[] { dayOfWeek, dayOfWeek, periodNo };
        }

        List<Map<String, Object>> teachers = jdbc.queryForList(sql, params);

        // Convert to SuggestedTeacher with workload warnings
        final int maxLoad = maxPeriodsPerDay;
        List<SuggestedTeacher> suggestions = teachers.stream()
                .map(t -> {
                    Long id = ((Number) t.get("id")).longValue();
                    String name = (String) t.get("name");
                    String dept = (String) t.get("department");
                    Integer currentLoad = ((Number) t.get("current_load")).intValue();
                    boolean isOverloaded = currentLoad >= maxLoad;

                    String warning = null;
                    if (isOverloaded) {
                        warning = String.format(
                                "⚠️ This teacher already has %d periods today (max recommended: %d). Consider assigning to a teacher with lighter workload.",
                                currentLoad, maxLoad);
                    } else if (currentLoad >= maxLoad - 1) {
                        warning = String.format(
                                "ℹ️ This teacher will have %d periods today after assignment (max recommended: %d).",
                                currentLoad + 1, maxLoad);
                    }

                    return new SuggestedTeacher(id, name, dept, currentLoad, maxLoad, isOverloaded, warning);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(suggestions);
    }

    /**
     * Create a substitution
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<Map<String, Object>> createSubstitution(
            @RequestBody SubstitutionRequest req,
            @RequestHeader(value = "X-User-Name", required = false) String userName) {

        if (req.date() == null || req.classId() == null || req.section() == null ||
                req.periodNo() == null || req.substituteTeacherId() == null) {
            return ResponseEntity.badRequest().build();
        }

        Long sectionId = resolveSectionIdIfNeeded(req.classId(), req.section());
        if (sectionId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Check if substitution already exists
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM timetable_substitutions WHERE date = ? AND class_id = ? AND section_id = ? AND period_no = ?",
                Integer.class, req.date(), req.classId(), sectionId, req.periodNo());

        if (count != null && count > 0) {
            return ResponseEntity.status(409).build(); // Conflict
        }

        // Check if substitute teacher is available (not teaching another class at this time)
        int dayOfWeek = req.date().getDayOfWeek().getValue();
        Integer conflicts = jdbc.queryForObject(
                "SELECT COUNT(*) FROM timetable_slots WHERE teacher_details_id = ? AND day_of_week = ? AND period_no = ?",
                Integer.class, req.substituteTeacherId(), dayOfWeek, req.periodNo());

        if (conflicts != null && conflicts > 0) {
            return ResponseEntity.status(422).build(); // Unprocessable - teacher has conflict
        }

        // Insert substitution
        String approvedBy = userName != null ? userName : "admin";
        jdbc.update(
                "INSERT INTO timetable_substitutions (date, class_id, section_id, period_no, original_teacher_details_id, substitute_teacher_details_id, reason, approved_by) "
                        +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                req.date(), req.classId(), sectionId, req.periodNo(), req.originalTeacherId(),
                req.substituteTeacherId(), req.reason(), approvedBy);

        // Fetch the created substitution
        Map<String, Object> created = jdbc.queryForMap(
                "SELECT ts.id, ts.date, ts.class_id as \"classId\", ts.section_id as \"sectionId\", " +
                        "ts.period_no as \"periodNo\", ts.reason, ts.approved_by as \"approvedBy\" " +
                        "FROM timetable_substitutions ts " +
                        "WHERE ts.date = ? AND ts.class_id = ? AND ts.section_id = ? AND ts.period_no = ?",
                req.date(), req.classId(), sectionId, req.periodNo());

        return ResponseEntity.ok(created);
    }

    /**
     * Delete a substitution
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<Void> deleteSubstitution(@PathVariable Long id) {
        int deleted = jdbc.update("DELETE FROM timetable_substitutions WHERE id = ?", id);

        if (deleted == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    private Long resolveSectionIdIfNeeded(Long classId, String section) {
        try {
            return Long.parseLong(section);
        } catch (NumberFormatException ignore) {
        }

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
