package com.school.exam.service;

import com.school.exam.model.Exam;
import com.school.exam.model.ExamResult;
import com.school.exam.repository.ExamRepository;
import com.school.exam.repository.ExamResultRepository;
import com.school.exam.dto.ExamRequest;
import com.school.exam.dto.ExamResultRequest;
import com.school.exam.dto.ExamSummary;
import com.school.student.model.Student;
import com.school.student.service.StudentService;
import com.school.exam.exception.ExamNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExamServiceTest {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private ExamResultRepository examResultRepository;

    @Mock
    private StudentService studentService;

    @InjectMocks
    private ExamService examService;

    private Exam exam;
    private ExamResult examResult;
    private Student student;
    private ExamRequest examRequest;
    private ExamResultRequest resultRequest;
    private LocalDateTime examDate;

    @BeforeEach
    void setUp() {
        examDate = LocalDateTime.now().plusDays(7);

        examRequest = new ExamRequest();
        examRequest.setName("Final Math Exam");
        examRequest.setSubject("Mathematics");
        examRequest.setGrade(10);
        examRequest.setExamDate(examDate);
        examRequest.setTotalMarks(100.0);
        examRequest.setPassingMarks(40.0);
        examRequest.setExamType(Exam.ExamType.FINAL);

        exam = Exam.builder()
                .name(examRequest.getName())
                .subject(examRequest.getSubject())
                .grade(examRequest.getGrade())
                .examDate(examRequest.getExamDate())
                .totalMarks(examRequest.getTotalMarks())
                .passingMarks(examRequest.getPassingMarks())
                .examType(examRequest.getExamType())
                .build();

        student = Student.builder()
                .firstName("John")
                .lastName("Doe")
                .grade(10)
                .section("A")
                .build();

        resultRequest = new ExamResultRequest();
        resultRequest.setExamId(1L);
        resultRequest.setStudentId(1L);
        resultRequest.setMarksObtained(85.0);
        resultRequest.setRemarks("Excellent performance");

        examResult = ExamResult.builder()
                .exam(exam)
                .student(student)
                .marksObtained(resultRequest.getMarksObtained())
                .remarks(resultRequest.getRemarks())
                .status(ExamResult.ResultStatus.PASS)
                .build();
    }

    @Test
    void createExam_Success() {
        when(examRepository.save(any(Exam.class))).thenReturn(exam);

        Exam result = examService.createExam(examRequest);

        assertNotNull(result);
        assertEquals(exam.getName(), result.getName());
        assertEquals(exam.getSubject(), result.getSubject());
        verify(examRepository).save(any(Exam.class));
    }

    @Test
    void updateExam_Success() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));
        when(examRepository.save(any(Exam.class))).thenReturn(exam);

        Exam result = examService.updateExam(1L, examRequest);

        assertNotNull(result);
        assertEquals(examRequest.getName(), result.getName());
        verify(examRepository).save(any(Exam.class));
    }

    @Test
    void updateExam_NotFound() {
        when(examRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ExamNotFoundException.class, () -> {
            examService.updateExam(1L, examRequest);
        });
    }

    @Test
    void recordResult_Success() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));
        when(studentService.getStudent(1L)).thenReturn(student);
        when(examResultRepository.save(any(ExamResult.class))).thenReturn(examResult);

        ExamResult result = examService.recordResult(resultRequest);

        assertNotNull(result);
        assertEquals(resultRequest.getMarksObtained(), result.getMarksObtained());
        assertEquals(ExamResult.ResultStatus.PASS, result.getStatus());
        verify(examResultRepository).save(any(ExamResult.class));
    }

    @Test
    void getStudentResults_Success() {
        when(examResultRepository.findByStudentId(1L)).thenReturn(Arrays.asList(examResult));

        List<ExamResult> results = examService.getStudentResults(1L);

        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertEquals(1, results.size());
        assertEquals(examResult.getMarksObtained(), results.get(0).getMarksObtained());
    }

    @Test
    void generateExamSummary_Success() {
        when(examRepository.findById(1L)).thenReturn(Optional.of(exam));
        when(examResultRepository.findByExamId(1L)).thenReturn(Arrays.asList(examResult));

        ExamSummary summary = examService.generateExamSummary(1L);

        assertNotNull(summary);
        assertEquals(1L, summary.getExamId());
        assertEquals(exam.getName(), summary.getExamName());
        assertEquals(1, summary.getTotalStudents());
        assertTrue(summary.getPassPercentage() > 0);
        assertNotNull(summary.getScoreDistribution());
        assertNotNull(summary.getSectionWiseAverage());
    }
}
