package com.school.exam.controller;

import com.school.exam.model.Exam;
import com.school.exam.model.ExamResult;
import com.school.exam.service.ExamService;
import com.school.exam.dto.ExamRequest;
import com.school.exam.dto.ExamResultRequest;
import com.school.exam.dto.ExamSummary;
import com.school.student.model.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExamController.class)
class ExamControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExamService examService;

    private Exam exam;
    private ExamResult examResult;
    private Student student;
    private ExamRequest examRequest;
    private ExamResultRequest resultRequest;
    private ExamSummary examSummary;
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
        // Set ID after creation for testing
        setId(exam, 1L);

        student = Student.builder()
                .firstName("John")
                .lastName("Doe")
                .grade(10)
                .section("A")
                .build();
        setId(student, 1L);

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
        setId(examResult, 1L);

        Map<String, Long> scoreDistribution = new HashMap<>();
        scoreDistribution.put("80-89", 1L);

        Map<String, Double> sectionWiseAverage = new HashMap<>();
        sectionWiseAverage.put("A", 85.0);

        examSummary = ExamSummary.builder()
                .examId(1L)
                .examName(exam.getName())
                .subject(exam.getSubject())
                .grade(exam.getGrade())
                .totalStudents(1)
                .averageScore(85.0)
                .highestScore(85.0)
                .lowestScore(85.0)
                .passCount(1)
                .failCount(0)
                .passPercentage(100.0)
                .scoreDistribution(scoreDistribution)
                .sectionWiseAverage(sectionWiseAverage)
                .build();
    }

    // Helper method to set id using reflection since it's managed by BaseEntity
    private void setId(Object entity, Long id) {
        try {
            var field = entity.getClass().getSuperclass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            // Ignore any reflection errors in tests
        }
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createExam_Success() throws Exception {
        when(examService.createExam(any(ExamRequest.class))).thenReturn(exam);

        mockMvc.perform(post("/api/exams")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(examRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value(exam.getName()))
                .andExpect(jsonPath("$.subject").value(exam.getSubject()));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateExam_Success() throws Exception {
        when(examService.updateExam(eq(1L), any(ExamRequest.class))).thenReturn(exam);

        mockMvc.perform(put("/api/exams/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(examRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value(exam.getName()));
    }

    @Test
    @WithMockUser(roles = "TEACHER")
    void recordResult_Success() throws Exception {
        when(examService.recordResult(any(ExamResultRequest.class))).thenReturn(examResult);

        mockMvc.perform(post("/api/exams/results")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resultRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.marksObtained").value(examResult.getMarksObtained()))
                .andExpect(jsonPath("$.status").value(examResult.getStatus().toString()));
    }

    @Test
    @WithMockUser(roles = "TEACHER")
    void getStudentResults_Success() throws Exception {
        when(examService.getStudentResults(1L)).thenReturn(Arrays.asList(examResult));

        mockMvc.perform(get("/api/exams/results/student/{studentId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].marksObtained").value(examResult.getMarksObtained()));
    }

    @Test
    @WithMockUser(roles = "TEACHER")
    void getExamSummary_Success() throws Exception {
        when(examService.generateExamSummary(1L)).thenReturn(examSummary);

        mockMvc.perform(get("/api/exams/{id}/summary", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.examId").value(1L))
                .andExpect(jsonPath("$.examName").value(examSummary.getExamName()))
                .andExpect(jsonPath("$.totalStudents").value(examSummary.getTotalStudents()))
                .andExpect(jsonPath("$.passPercentage").value(examSummary.getPassPercentage()));
    }
}