package com.school.security;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("authz")
public class AuthorizationService {

    private final JdbcTemplate jdbc;

    public AuthorizationService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean isMyStaffId(Long staffId) {
        if (staffId == null) return false;
        Long userId = currentUserId();
        if (userId == null) return false;
        Long myStaffId = jdbc.query(
                "select staff_id from school_staff where user_id = ?",
                rs -> rs.next() ? rs.getLong(1) : null,
                userId);
        return myStaffId != null && myStaffId.equals(staffId);
    }

    public boolean isTeacherOfClassSection(Long classId, String section) {
        if (classId == null || section == null || section.isBlank()) return false;
        Long teacherDetailsId = currentTeacherDetailsId();
        if (teacherDetailsId == null) return false;
        String sectionLetter = resolveSectionName(section);
        Integer count = jdbc.queryForObject(
                "select count(1) from teacher_class_map where teacher_details_id=? and class_id=? and section=?",
                Integer.class, teacherDetailsId, classId, sectionLetter);
        return count != null && count > 0;
    }

    public boolean isTeacherOfClass(Long classId) {
        if (classId == null) return false;
        Long teacherDetailsId = currentTeacherDetailsId();
        if (teacherDetailsId == null) return false;
        Integer count = jdbc.queryForObject(
                "select count(1) from teacher_class_map where teacher_details_id=? and class_id=?",
                Integer.class, teacherDetailsId, classId);
        return count != null && count > 0;
    }

    public boolean isTeacherOfStudent(Long studentId) {
    if (studentId == null) return false;
    Long teacherDetailsId = currentTeacherDetailsId();
    if (teacherDetailsId == null) return false;

    // Get student's grade and section
    Integer grade = jdbc.query(
        "select grade from students where id = ?",
        rs -> rs.next() ? rs.getInt(1) : null,
        studentId);
    String section = jdbc.query(
        "select section from students where id = ?",
        rs -> rs.next() ? rs.getString(1) : null,
        studentId);
    if (grade == null || section == null) return false;

    // Resolve a class id for this grade (classes.name often stores grade label)
    Long classId = jdbc.query(
        "select id from classes where lower(name) = lower(cast(? as varchar)) or lower(name) = lower(? ) limit 1",
        rs -> rs.next() ? rs.getLong(1) : null,
        grade, "class " + grade);
    if (classId == null) {
        // Fallback via grade_levels table
        classId = jdbc.query(
            "select c.id from classes c join grade_levels gl on lower(c.name)=lower(cast(gl.grade_number as varchar)) where gl.grade_number = ? limit 1",
            rs -> rs.next() ? rs.getLong(1) : null,
            grade);
    }
    if (classId == null) return false;

    String sectionLetter = resolveSectionName(section);
    Integer count = jdbc.queryForObject(
        "select count(1) from teacher_class_map where teacher_details_id=? and class_id=? and section=?",
        Integer.class, teacherDetailsId, classId, sectionLetter);
    return count != null && count > 0;
    }

    // STUDENT-scoped helpers
    public boolean isMyStudentId(Long studentId) {
        if (studentId == null) return false;
        Long currentStudentId = currentStudentId();
        return currentStudentId != null && currentStudentId.equals(studentId);
    }

    public boolean isCurrentStudentsClassSection(Long classId, String sectionInput) {
        if (classId == null || sectionInput == null || sectionInput.isBlank()) return false;
        Integer myGrade = currentStudentGrade();
        String mySection = currentStudentSection();
        if (myGrade == null || mySection == null) return false;
        Long myClassId = resolveClassIdForGrade(myGrade);
        if (myClassId == null) return false;
        String sectionLetter = resolveSectionName(sectionInput);
        return myClassId.equals(classId) && mySection.equalsIgnoreCase(sectionLetter);
    }

    private Long currentStudentId() {
        String email = currentUserEmail();
        if (email == null) return null;
        return jdbc.query(
                "select id from students where lower(email) = lower(?)",
                rs -> rs.next() ? rs.getLong(1) : null,
                email);
    }

    private Integer currentStudentGrade() {
        String email = currentUserEmail();
        if (email == null) return null;
        return jdbc.query(
                "select grade from students where lower(email) = lower(?)",
                rs -> rs.next() ? rs.getInt(1) : null,
                email);
    }

    private String currentStudentSection() {
        String email = currentUserEmail();
        if (email == null) return null;
        return jdbc.query(
                "select section from students where lower(email) = lower(?)",
                rs -> rs.next() ? rs.getString(1) : null,
                email);
    }

    private Long resolveClassIdForGrade(Integer grade) {
        if (grade == null) return null;
        Long classId = jdbc.query(
            "select id from classes where lower(name) = lower(cast(? as varchar)) or lower(name) = lower(?) limit 1",
            rs -> rs.next() ? rs.getLong(1) : null,
            grade, "class " + grade);
        if (classId == null) {
            classId = jdbc.query(
                "select c.id from classes c join grade_levels gl on lower(c.name)=lower(cast(gl.grade_number as varchar)) where gl.grade_number = ? limit 1",
                rs -> rs.next() ? rs.getLong(1) : null,
                grade);
        }
        return classId;
    }

    private Long currentTeacherDetailsId() {
        Long userId = currentUserId();
        if (userId == null) return null;
        return jdbc.query(
                "select teacher_details_id from school_staff where user_id = ?",
                rs -> rs.next() ? rs.getLong(1) : null,
                userId);
    }

    private String resolveSectionName(String sectionInput) {
        if (sectionInput == null || sectionInput.isBlank()) return sectionInput;
        try {
            long sectionId = Long.parseLong(sectionInput);
            String name = jdbc.query(
                    "select section_name from sections where id = ?",
                    rs -> rs.next() ? rs.getString(1) : null,
                    sectionId);
            return name != null ? name : sectionInput;
        } catch (NumberFormatException ignore) {
            return sectionInput; // already a letter like 'A'
        }
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getId();
        }
        return null;
    }

    private String currentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getEmail();
        }
        return null;
    }
}
