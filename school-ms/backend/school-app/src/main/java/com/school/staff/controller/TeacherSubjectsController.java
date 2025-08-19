package com.school.staff.controller;

import com.school.exam.model.Subject;
import com.school.exam.repository.SubjectRepository;
import com.school.core.model.TeacherDetails;
import com.school.staff.model.TeacherSubjectMap;
import com.school.staff.repository.TeacherSubjectMapRepository;
import com.school.core.repository.TeacherDetailsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff/teachers")
public class TeacherSubjectsController {

    private final TeacherDetailsRepository teacherDetailsRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherSubjectMapRepository mapRepository;

    public TeacherSubjectsController(TeacherDetailsRepository tdr,
                                     SubjectRepository sr,
                                     TeacherSubjectMapRepository mr) {
        this.teacherDetailsRepository = tdr;
        this.subjectRepository = sr;
        this.mapRepository = mr;
    }

    static class SubjectDto {
        public Long id;
        public String name;
        SubjectDto(Long id, String name) { this.id = id; this.name = name; }
    }

    @GetMapping("/{teacherDetailsId}/subjects")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<List<SubjectDto>> getSubjects(@PathVariable Long teacherDetailsId) {
        TeacherDetails td = teacherDetailsRepository.findById(teacherDetailsId)
                .orElseThrow(() -> new IllegalArgumentException("TeacherDetails not found: " + teacherDetailsId));
        List<SubjectDto> body = mapRepository.findByTeacherDetails(td).stream()
                .map(m -> new SubjectDto(m.getSubject().getId(), m.getSubject().getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(body);
    }

    @PutMapping("/{teacherDetailsId}/subjects")
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<Void> replaceSubjects(@PathVariable Long teacherDetailsId,
                                                @RequestBody List<Long> subjectIds) {
        TeacherDetails td = teacherDetailsRepository.findById(teacherDetailsId)
                .orElseThrow(() -> new IllegalArgumentException("TeacherDetails not found: " + teacherDetailsId));
        // delete existing
        mapRepository.deleteAll(mapRepository.findByTeacherDetails(td));
        // insert new
        List<Subject> subjects = subjectRepository.findAllById(subjectIds);
        for (Subject s : subjects) {
            TeacherSubjectMap m = new TeacherSubjectMap();
            m.setTeacherDetails(td);
            m.setSubject(s);
            mapRepository.save(m);
        }
        return ResponseEntity.noContent().build();
    }
}
