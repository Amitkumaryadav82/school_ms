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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

    @Autowired
    private StudentService studentService;

    public Exam createExam(ExamRequest request) {
        Exam exam = Exam.builder()
                .name(request.getName())
                .subject(request.getSubject())
                .grade(request.getGrade())
                .examDate(request.getExamDate())
                .description(request.getDescription())
                .totalMarks(request.getTotalMarks())
                .passingMarks(request.getPassingMarks())
                .examType(request.getExamType())
                .build();
        return examRepository.save(exam);
    }

    public Exam updateExam(Long id, ExamRequest request) {
        Exam exam = getExam(id);
        exam.setName(request.getName());
        exam.setSubject(request.getSubject());
        exam.setGrade(request.getGrade());
        exam.setExamDate(request.getExamDate());
        exam.setDescription(request.getDescription());
        exam.setTotalMarks(request.getTotalMarks());
        exam.setPassingMarks(request.getPassingMarks());
        exam.setExamType(request.getExamType());
        return examRepository.save(exam);
    }

    public Exam getExam(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + id));
    }

    public List<Exam> getExamsByGrade(Integer grade) {
        return examRepository.findByGrade(grade);
    }

    public List<Exam> getExamsBySubject(String subject) {
        return examRepository.findBySubject(subject);
    }

    public List<Exam> getExamsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return examRepository.findByExamDateBetween(startDate, endDate);
    }

    public ExamResult recordResult(ExamResultRequest request) {
        Exam exam = getExam(request.getExamId());
        Student student = studentService.getStudent(request.getStudentId());

        ExamResult result = ExamResult.builder()
                .exam(exam)
                .student(student)
                .marksObtained(request.getMarksObtained())
                .remarks(request.getRemarks())
                .build();

        return examResultRepository.save(result);
    }

    public ExamResult updateResult(Long examId, Long studentId, ExamResultRequest request) {
        ExamResult result = examResultRepository.findByExamIdAndStudentId(examId, studentId)
                .orElseThrow(() -> new ExamNotFoundException("Exam result not found"));

        result.setMarksObtained(request.getMarksObtained());
        result.setRemarks(request.getRemarks());
        return examResultRepository.save(result);
    }

    public List<ExamResult> getStudentResults(Long studentId) {
        return examResultRepository.findByStudentId(studentId);
    }

    public ExamSummary generateExamSummary(Long examId) {
        Exam exam = getExam(examId);
        List<ExamResult> results = examResultRepository.findByExamId(examId);

        if (results.isEmpty()) {
            return ExamSummary.builder()
                    .examId(examId)
                    .examName(exam.getName())
                    .subject(exam.getSubject())
                    .grade(exam.getGrade())
                    .totalStudents(0)
                    .build();
        }

        DoubleSummaryStatistics stats = results.stream()
                .mapToDouble(ExamResult::getMarksObtained)
                .summaryStatistics();

        long passCount = results.stream()
                .filter(r -> r.getStatus() == ExamResult.ResultStatus.PASS)
                .count();

        Map<String, Long> scoreDistribution = calculateScoreDistribution(results);
        Map<String, Double> sectionWiseAverage = calculateSectionWiseAverage(results);

        return ExamSummary.builder()
                .examId(examId)
                .examName(exam.getName())
                .subject(exam.getSubject())
                .grade(exam.getGrade())
                .totalStudents(results.size())
                .averageScore(stats.getAverage())
                .highestScore(stats.getMax())
                .lowestScore(stats.getMin())
                .passCount((int) passCount)
                .failCount((int) (results.size() - passCount))
                .passPercentage((double) passCount / results.size() * 100)
                .scoreDistribution(scoreDistribution)
                .sectionWiseAverage(sectionWiseAverage)
                .build();
    }

    private Map<String, Long> calculateScoreDistribution(List<ExamResult> results) {
        return results.stream()
                .collect(Collectors.groupingBy(
                        this::getScoreRange,
                        Collectors.counting()));
    }

    private Map<String, Double> calculateSectionWiseAverage(List<ExamResult> results) {
        return results.stream()
                .collect(Collectors.groupingBy(
                        result -> result.getStudent().getSection(),
                        Collectors.averagingDouble(ExamResult::getMarksObtained)));
    }

    private String getScoreRange(ExamResult result) {
        double percentage = (result.getMarksObtained() / result.getExam().getTotalMarks()) * 100;
        if (percentage >= 90)
            return "90-100";
        if (percentage >= 80)
            return "80-89";
        if (percentage >= 70)
            return "70-79";
        if (percentage >= 60)
            return "60-69";
        if (percentage >= 50)
            return "50-59";
        return "Below 50";
    }
}
