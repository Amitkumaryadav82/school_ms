package com.school.exam.controller;

import com.school.exam.dto.StudentMarksDTO;
import com.school.exam.dto.BulkMarksUpdateRequest;
import com.school.exam.dto.MarksMatrixResponse;
import com.school.exam.dto.MarksMatrixSaveRequest;
import com.school.exam.service.ExamMarksService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams/marks")
public class ExamMarksController {
    private final ExamMarksService service;

    public ExamMarksController(ExamMarksService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or (hasRole('TEACHER') and @authz.isTeacherOfClass(#classId)) or (hasRole('STUDENT') and @authz.isMyStudentId(#studentId))")
    public ResponseEntity<StudentMarksDTO> getStudentMarks(@RequestParam Long examId,
            @RequestParam Long classId,
            @RequestParam Long subjectId,
            @RequestParam Long studentId) {
        return ResponseEntity.ok(service.getStudentMarks(examId, classId, subjectId, studentId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or (hasRole('TEACHER') and @authz.isTeacherOfStudent(#dto.studentId))")
    public ResponseEntity<Void> saveStudentMarks(@RequestBody StudentMarksDTO dto) {
        service.saveStudentMarks(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/lock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Void> lockMarks(@RequestParam Long examId,
            @RequestParam Long subjectId,
            @RequestBody List<Long> studentIds) {
        service.lockMarks(examId, subjectId, studentIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/edit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> editLockedMark(@RequestParam Long examId,
            @RequestParam Long subjectId,
            @RequestParam Long studentId,
            @RequestParam Long questionFormatId,
            @RequestParam Double newMarks,
            @RequestParam String reason) {
        service.editLockedMark(examId, subjectId, studentId, questionFormatId, newMarks, reason);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('TEACHER') and @authz.isTeacherOfClass(#request.classId))")
    public ResponseEntity<Void> bulkUpdate(@RequestBody BulkMarksUpdateRequest request) {
        service.bulkUpdate(request.getExamId(), request.getClassId(), request.getSubjectId(), request.getUpdates());
        return ResponseEntity.ok().build();
    }

    // Matrix: subjects constrained by QPF for exam+class; rows are students of the
    // section
    @GetMapping("/matrix")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('TEACHER') and @authz.isTeacherOfClassSection(#classId, #section))")
    public ResponseEntity<MarksMatrixResponse> getMatrix(@RequestParam Long examId,
            @RequestParam Long classId,
            @RequestParam Integer grade,
            @RequestParam String section) {
        return ResponseEntity.ok(service.getMarksMatrix(examId, classId, grade, section));
    }

    @PostMapping("/matrix")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('TEACHER') and @authz.isTeacherOfClass(#request.classId))")
    public ResponseEntity<Void> saveMatrix(@RequestBody MarksMatrixSaveRequest request) {
        service.saveMarksMatrix(request);
        return ResponseEntity.ok().build();
    }
}
