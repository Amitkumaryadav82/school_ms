package com.school.staff.controller;

import com.school.core.model.TeacherDetails;
import com.school.core.repository.TeacherDetailsRepository;
import com.school.exam.model.SchoolClass;
import com.school.exam.repository.SchoolClassRepository;
import com.school.staff.model.TeacherClassMap;
import com.school.staff.repository.TeacherClassMapRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff/teachers")
public class TeacherClassesController {

    private final TeacherDetailsRepository teacherDetailsRepository;
    private final SchoolClassRepository classRepository;
    private final TeacherClassMapRepository mapRepository;

    public TeacherClassesController(TeacherDetailsRepository tdr,
            SchoolClassRepository scr,
            TeacherClassMapRepository mpr) {
        this.teacherDetailsRepository = tdr;
        this.classRepository = scr;
        this.mapRepository = mpr;
    }

    public static class ClassMapDto {
        public Long classId;
        public String className;
        public String section;
        public String academicYear;

        public ClassMapDto(Long classId, String className, String section, String academicYear) {
            this.classId = classId;
            this.className = className;
            this.section = section;
            this.academicYear = academicYear;
        }
    }

    @GetMapping("/{teacherDetailsId}/classes")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<List<ClassMapDto>> getClasses(@PathVariable Long teacherDetailsId) {
        TeacherDetails td = teacherDetailsRepository.findById(teacherDetailsId)
                .orElseThrow(() -> new IllegalArgumentException("TeacherDetails not found: " + teacherDetailsId));
        List<ClassMapDto> body = mapRepository.findByTeacherDetails(td).stream()
                .map(m -> new ClassMapDto(m.getSchoolClass().getId(), m.getSchoolClass().getName(), m.getSection(),
                        m.getAcademicYear()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(body);
    }

    @PutMapping("/{teacherDetailsId}/classes")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<Void> replaceClasses(@PathVariable Long teacherDetailsId,
            @RequestBody List<Map<String, Object>> classSectionList) {
        TeacherDetails td = teacherDetailsRepository.findById(teacherDetailsId)
                .orElseThrow(() -> new IllegalArgumentException("TeacherDetails not found: " + teacherDetailsId));

        // delete existing
        mapRepository.deleteAll(mapRepository.findByTeacherDetails(td));

        // insert new
        for (Map<String, Object> item : classSectionList) {
            Object cid = item.get("classId");
            Object sec = item.get("section");
            Object year = item.get("academicYear");
            if (cid == null || sec == null)
                continue;
            Long classId = Long.valueOf(cid.toString());
            String section = sec.toString();
            String academicYear = year != null ? year.toString() : null;

            SchoolClass clazz = classRepository.findById(classId)
                    .orElseThrow(() -> new IllegalArgumentException("Class not found: " + classId));

            TeacherClassMap map = new TeacherClassMap();
            map.setTeacherDetails(td);
            map.setSchoolClass(clazz);
            map.setSection(section);
            map.setAcademicYear(academicYear);
            mapRepository.save(map);
        }
        return ResponseEntity.noContent().build();
    }
}
