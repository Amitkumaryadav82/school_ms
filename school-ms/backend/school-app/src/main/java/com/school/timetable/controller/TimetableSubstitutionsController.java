package com.school.timetable.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
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
            String reason,
            String notes) {
    }

    public record TeacherSuggestion(
            Long teacherId,
            String teacherName,
            String department,
            Integer currentDayLoad,
            Integer maxDayLoad,
            Boolean isOverloaded,
            String warningMessage) {
    }

    public record AffectedPeriod(
            Long classId,
            String className,
            Long sectionId,
            String sectionName,
            Integer periodNo,
            Long subjectId,
            String subjectCode,
            String subjectName,
            String timeSlot) {
    }

    // Get all substitutions for a specific date
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL','STAFF')")
    public ResponseEntity<List<Map<String, Object>>> getSubstitutions(@RequestParam LocalDate date) {
        List<Map<String, Object>> substitutions = jdbc.queryForList(
                "SELECT ts.id, ts.date, ts.class_id as \"classId\", ts.section_id as \"sectionId\", " +
                        "ts.period_no as \"periodNo\", ts.reason, ts.notes, ts.approved_by as \"approvedBy\", " +
                        "c.name as \"className\", s.section_name as \"sectionName\", " +
                        "subj.code as \"subjectCode\", subj.name as \"subjectName\", " +
                        "orig_td.id as \"originalTeacherId\", " +
                        "COALESCE(orig_ss.first_name || ' ' || orig_ss.last_name, 'Unknown') as \"originalTeacherName\", " +
                        "sub_td.id as \"substituteTeacherId\", " +
                        "COALESCE(sub_ss.first_name || ' ' || sub_ss.last_name, 'Unknown') as \"substituteTeacherName\" " +
                        "FROM timetable_substitutions ts " +
                        "JOIN classes c ON c.id = ts.class_id " +
                        "LEFT JOIN sections sec ON sec.id = ts.section_id " +
                        "LEFT JOIN teacher_details orig_td ON orig_td.id = ts.original_teacher_details_id " +
                        "LEFT JOIN school_staff orig_ss ON orig_ss.teacher_details_id = orig_td.id " +
                        "LEFT JOIN teacher_details sub_td ON sub_td.id = ts.substitute_teacher_details_id " +
                        "LEFT JOIN school_staff sub_ss ON sub_ss.teacher_details_id = sub_td.id " +
                        "LEFT JOIN timetable_slots tslot ON tslot.class_id = ts.class_id " +
                        "   AND tslot.section_id = ts.section_id AND tslot.period_no = ts.period_no " +
                        "LEFT JOIN subjects subj ON subj.id = tslot.subject_id " +
                        "WHERE ts.date = ? " +
                        "ORDER BY c.name, sec.section_name, ts.period_no",
                date);

        return ResponseEntity.ok(substitutions);
    }

    // Get affected periods for an absent teacher on a specific date
    @GetMapping("/affected-periods")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL','STAFF')")
    public ResponseEntity<List<AffectedPeriod>> getAffectedPeriods(
            @RequestParam Long teacherId,
            @RequestParam LocalDate date) {

        // Get day of week (1=Monday, 7=Sunday)
        int dayOfWeek = date.getDayOfWeek().getValue();

        List<Map<String, Object>> periods = jdbc.queryForList(
                "SELECT ts.class_id as \"classId\", c.name as \"className\", " +
                        "ts.section_id as \"sectionId\", sec.section_name as \"sectionName\", " +
                        "ts.period_no as \"periodNo\", ts.subject_id as \"subjectId\", " +
                        "s.code as \"subjectCode\", s.name as \"subjectName\" " +
                        "FROM timetable_slots ts " +
                        "JOIN classes c ON c.id = ts.class_id " +
                        "LEFT JOIN sections sec ON sec.id = ts.section_id " +
                        "LEFT JOIN subjects s ON s.id = ts.subject_id " +
                        "WHERE ts.teacher_details_id = ? AND ts.day_of_week = ? " +
                        "ORDER BY ts.period_no",
                teacherId, dayOfWeek);

        List<AffectedPeriod> affectedPeriods = periods.stream()
                .map(p -> new AffectedPeriod(
                        ((Number) p.get("classId")).longValue(),
                        (String) p.get("className"),
                        p.get("sectionId") != null ? ((Number) p.get("sectionId")).longValue() : null,
                        (String) p.get("sectionName"),
                        ((Number) p.get("periodNo")).intValue(),
                        p.get("subjectId") != null ? ((Number) p.get("subjectId")).longValue() : null,
                        (String) p.get("subjectCode"),
                        (String) p.get("subjectName"),
                        getTimeSlot(((Number) p.get("periodNo")).intValue())))
                .collect(Collectors.toList());

        return ResponseEntity.ok(affectedPeriods);
    }

    // Get suggested substitute teachers for a specific period
    @GetMapping("/suggest-teachers")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL','STAFF')")
    public ResponseEntity<List<TeacherSuggestion>> suggestTeachers(
            @RequestParam Long classId,
            @RequestParam String section,
            @RequestParam Integer periodNo,
            @RequestParam Long subjectId,
            @RequestParam LocalDate date) {

        // Get day of week
        int dayOfWeek = date.getDayOfWeek().getValue();

        // Resolve section ID
        Long sectionId = resolveSectionIdIfNeeded(classId, section);
        String sectionLetter = resolveSectionNameIfNeeded(section);

        // Get max periods per teacher per day from settings
        Integer maxPeriodsPerDay = jdbc.queryForObject(
                "SELECT COALESCE(max_periods_per_teacher_per_day, 5) FROM timetable_settings ORDER BY id LIMIT 1",
                Integer.class);
        if (maxPeriodsPerDay == null)
            maxPeriodsPerDay = 5;

        // Find eligible teachers (teach this subject)
        List<Map<String, Object>> eligibleTeachers = jdbc.queryForList(
                "SELECT DISTINCT td.id as \"teacherId\", " +
                        "COALESCE(ss.first_name || ' ' || ss.last_name, 'Teacher #' || td.id) as \"teacherName\", " +
                        "ss.department " +
                        "FROM teacher_subject_map tsm " +
                        "JOIN teacher_details td ON td.id = tsm.teacher_details_id " +
                        "LEFT JOIN school_staff ss ON ss.teacher_details_id = td.id " +
                        "WHERE tsm.subject_id = ? " +
                        "AND ss.is_active = TRUE",
                subjectId);

        List<TeacherSuggestion> suggestions = new ArrayList<>();

        for (Map<String, Object> teacher : eligibleTeachers) {
            Long teacherId = ((Number) teacher.get("teacherId")).longValue();
            String teacherName = (String) teacher.get("teacherName");
            String department = (String) teacher.get("department");

            // Check if teacher is already teaching at this time
            Integer conflictCount = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM timetable_slots " +
                            "WHERE teacher_details_id = ? AND day_of_week = ? AND period_no = ?",
                    Integer.class, teacherId, dayOfWeek, periodNo);

            if (conflictCount != null && conflictCount > 0) {
                continue; // Skip teachers who are already teaching
            }

            // Check if teacher already has a substitution at this time on this date
            Integer substCount = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM timetable_substitutions " +
                            "WHERE substitute_teacher_details_id = ? AND date = ? AND period_no = ?",
                    Integer.class, teacherId, date, periodNo);

            if (substCount != null && substCount > 0) {
                continue; // Skip teachers who already have a substitution
            }

            // Calculate current day load (regular + substitutions)
            Integer regularLoad = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM timetable_slots " +
                            "WHERE teacher_details_id = ? AND day_of_week = ?",
                    Integer.class, teacherId, dayOfWeek);

            Integer substLoad = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM timetable_substitutions " +
                            "WHERE substitute_teacher_details_id = ? AND date = ?",
                    Integer.class, teacherId, date);

            int currentLoad = (regularLoad != null ? regularLoad : 0) + (substLoad != null ? substLoad : 0);
            boolean isOverloaded = currentLoad >= maxPeriodsPerDay;

            String warningMessage = null;
            if (isOverloaded) {
                warningMessage = String.format(
                        "Warning: This teacher already has %d periods today (max recommended: %d). Consider assigning to a teacher with lighter workload.",
                        currentLoad, maxPeriodsPerDay);
            }

            suggestions.add(new TeacherSuggestion(
                    teacherId,
                    teacherName,
                    department,
                    currentLoad,
                    maxPeriodsPerDay,
                    isOverloaded,
                    warningMessage));
        }

        // Sort by current load (ascending) - lighter workload first
        suggestions.sort(Comparator.comparingInt(TeacherSuggestion::currentDayLoad));

        return ResponseEntity.ok(suggestions);
    }

    // Create a substitution
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<Map<String, Object>> createSubstitution(@RequestBody SubstitutionRequest req) {
        if (req.date() == null || req.classId() == null || req.section() == null ||
                req.periodNo() == null || req.substituteTeacherId() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Resolve section ID
        Long sectionId = resolveSectionIdIfNeeded(req.classId(), req.section());
        if (sectionId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Check if substitution already exists
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM timetable_substitutions " +
                        "WHERE date = ? AND class_id = ? AND section_id = ? AND period_no = ?",
                Integer.class, req.date(), req.classId(), sectionId, req.periodNo());

        if (count != null && count > 0) {
            return ResponseEntity.status(409).build(); // Conflict
        }

        // Insert substitution
        jdbc.update(
                "INSERT INTO timetable_substitutions " +
                        "(date, class_id, section_id, period_no, original_teacher_details_id, " +
                        "substitute_teacher_details_id, reason, notes, approved_by) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                req.date(), req.classId(), sectionId, req.periodNo(),
                req.originalTeacherId(), req.substituteTeacherId(),
                req.reason(), req.notes(), "ADMIN");

        // Fetch the created substitution
        Map<String, Object> created = jdbc.queryForMap(
                "SELECT ts.id, ts.date, ts.class_id as \"classId\", ts.section_id as \"sectionId\", " +
                        "ts.period_no as \"periodNo\", ts.reason, ts.notes " +
                        "FROM timetable_substitutions ts " +
                        "WHERE ts.date = ? AND ts.class_id = ? AND ts.section_id = ? AND ts.period_no = ?",
                req.date(), req.classId(), sectionId, req.periodNo());

        return ResponseEntity.ok(created);
    }

    // Delete a substitution
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<Void> deleteSubstitution(@PathVariable Long id) {
        int deleted = jdbc.update("DELETE FROM timetable_substitutions WHERE id = ?", id);

        if (deleted == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    // Helper methods
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

    private String resolveSectionNameIfNeeded(String sectionInput) {
        if (sectionInput == null || sectionInput.isBlank())
            return sectionInput;
        try {
            long sectionId = Long.parseLong(sectionInput);
            String name = jdbc.query(
                    "SELECT section_name FROM sections WHERE id = ?",
                    rs -> rs.next() ? rs.getString(1) : null,
                    sectionId);
            return name != null ? name : sectionInput;
        } catch (NumberFormatException ignore) {
            return sectionInput;
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

    private String getTimeSlot(int periodNo) {
        // Assuming 8:30 AM start, 40 min periods, 10 min breaks
        int startHour = 8;
        int startMin = 30;
        int totalMinutes = startMin + ((periodNo - 1) * 50); // 40 min period + 10 min break

        int hour = startHour + (totalMinutes / 60);
        int min = totalMinutes % 60;
        int endHour = hour;
        int endMin = min + 40;
        if (endMin >= 60) {
            endHour++;
            endMin -= 60;
        }

        return String.format("%02d:%02d - %02d:%02d", hour, min, endHour, endMin);
    }
}
