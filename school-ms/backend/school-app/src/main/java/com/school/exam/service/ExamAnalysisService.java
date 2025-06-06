package com.school.exam.service;

import com.school.exam.model.*;
import com.school.exam.repository.*;
import com.school.exam.dto.DetailedExamSummary;
import com.school.student.model.Student;
import com.school.student.repository.StudentRepository;
import com.school.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExamAnalysisService {

        @Autowired
        private ExamService examService;

        @Autowired
        private ExamResultRepository examResultRepository;

        @Autowired
        private DetailedExamResultRepository detailedExamResultRepository;

        @Autowired
        private QuestionRepository questionRepository;

        @Autowired
        private StudentRepository studentRepository;

        @Autowired
        private AttendanceService attendanceService;

        public DetailedExamSummary generateDetailedExamSummary(Long examId) {
                Exam exam = examService.getExam(examId);
                List<ExamResult> results = examResultRepository.findByExamId(examId);

                if (results.isEmpty()) {
                        return DetailedExamSummary.builder()
                                        .examId(examId)
                                        .examName(exam.getName())
                                        .subject(exam.getSubject())
                                        .grade(exam.getGrade())
                                        .totalStudents(0)
                                        .build();
                }

                // Get all detailed results for this exam
                List<DetailedExamResult> detailedResults = detailedExamResultRepository.findByExamId(examId);

                // Basic statistics
                DoubleSummaryStatistics stats = results.stream()
                                .mapToDouble(ExamResult::getMarksObtained)
                                .summaryStatistics();

                long passCount = results.stream()
                                .filter(r -> r.getStatus() == ExamResult.ResultStatus.PASS)
                                .count();

                // Chapter-wise performance
                Map<String, Double> chapterWisePerformance = calculateChapterWisePerformance(detailedResults);

                // Question type wise performance
                Map<String, Double> questionTypeWisePerformance = calculateQuestionTypeWisePerformance(detailedResults);

                // Difficulty level performance (based on overall score percentage in sections)
                Map<String, Double> difficultyLevelPerformance = calculateDifficultyLevelPerformance(detailedResults);

                // Top performers (top 5 students)
                List<DetailedExamSummary.StudentPerformance> topPerformers = getTopPerformers(results, detailedResults,
                                5);

                // Question analysis
                List<DetailedExamSummary.QuestionPerformance> questionAnalysis = analyzeQuestions(detailedResults);

                return DetailedExamSummary.builder()
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
                                .chapterWisePerformance(chapterWisePerformance)
                                .questionTypeWisePerformance(questionTypeWisePerformance)
                                .difficultyLevelPerformance(difficultyLevelPerformance)
                                .topPerformers(topPerformers)
                                .questionAnalysis(questionAnalysis)
                                .build();
        }

        private Map<String, Double> calculateChapterWisePerformance(List<DetailedExamResult> detailedResults) {
                // Group by chapter and calculate average percentage score
                Map<String, List<DetailedExamResult>> resultsByChapter = detailedResults.stream()
                                .filter(result -> result.getQuestion().getChapter() != null)
                                .collect(Collectors.groupingBy(result -> result.getQuestion().getChapter()));

                Map<String, Double> chapterPerformance = new HashMap<>();

                for (Map.Entry<String, List<DetailedExamResult>> entry : resultsByChapter.entrySet()) {
                        String chapterName = entry.getKey();

                        double totalMarks = entry.getValue().stream()
                                        .mapToDouble(result -> result.getQuestion().getMarks())
                                        .sum();

                        double marksObtained = entry.getValue().stream()
                                        .mapToDouble(DetailedExamResult::getMarksObtained)
                                        .sum();

                        double percentage = (totalMarks > 0) ? (marksObtained / totalMarks) * 100 : 0;
                        chapterPerformance.put(chapterName, Math.round(percentage * 100.0) / 100.0);
                }

                return chapterPerformance;
        }

        private Map<String, Double> calculateQuestionTypeWisePerformance(List<DetailedExamResult> detailedResults) {
                // Group by question type and calculate average percentage score
                Map<QuestionSection.QuestionType, List<DetailedExamResult>> resultsByType = detailedResults.stream()
                                .collect(Collectors.groupingBy(result -> result.getQuestion().getQuestionType()));

                Map<String, Double> typePerformance = new HashMap<>();

                for (Map.Entry<QuestionSection.QuestionType, List<DetailedExamResult>> entry : resultsByType
                                .entrySet()) {
                        String typeName = entry.getKey().toString();

                        double totalMarks = entry.getValue().stream()
                                        .mapToDouble(result -> result.getQuestion().getMarks())
                                        .sum();

                        double marksObtained = entry.getValue().stream()
                                        .mapToDouble(DetailedExamResult::getMarksObtained)
                                        .sum();

                        double percentage = (totalMarks > 0) ? (marksObtained / totalMarks) * 100 : 0;
                        typePerformance.put(typeName, Math.round(percentage * 100.0) / 100.0);
                }

                return typePerformance;
        }

        private Map<String, Double> calculateDifficultyLevelPerformance(List<DetailedExamResult> detailedResults) {
                // Group questions into difficulty categories based on average score percentage
                Map<String, List<DetailedExamResult>> resultsByDifficulty = new HashMap<>();

                Map<Long, List<DetailedExamResult>> resultsByQuestion = detailedResults.stream()
                                .collect(Collectors.groupingBy(result -> result.getQuestion().getId()));

                for (Map.Entry<Long, List<DetailedExamResult>> entry : resultsByQuestion.entrySet()) {
                        Question question = entry.getValue().get(0).getQuestion();
                        double maxMarks = question.getMarks();

                        double avgMarks = entry.getValue().stream()
                                        .mapToDouble(DetailedExamResult::getMarksObtained)
                                        .average()
                                        .orElse(0);

                        double scorePercentage = (maxMarks > 0) ? (avgMarks / maxMarks) * 100 : 0;

                        String difficulty;
                        if (scorePercentage >= 80) {
                                difficulty = "Easy";
                        } else if (scorePercentage >= 60) {
                                difficulty = "Medium";
                        } else {
                                difficulty = "Difficult";
                        }

                        if (!resultsByDifficulty.containsKey(difficulty)) {
                                resultsByDifficulty.put(difficulty, new ArrayList<>());
                        }
                        resultsByDifficulty.get(difficulty).addAll(entry.getValue());
                }

                // Calculate performance for each difficulty level
                Map<String, Double> difficultyPerformance = new HashMap<>();

                for (Map.Entry<String, List<DetailedExamResult>> entry : resultsByDifficulty.entrySet()) {
                        double totalMarks = entry.getValue().stream()
                                        .mapToDouble(result -> result.getQuestion().getMarks())
                                        .sum();

                        double marksObtained = entry.getValue().stream()
                                        .mapToDouble(DetailedExamResult::getMarksObtained)
                                        .sum();

                        double percentage = (totalMarks > 0) ? (marksObtained / totalMarks) * 100 : 0;
                        difficultyPerformance.put(entry.getKey(), Math.round(percentage * 100.0) / 100.0);
                }

                return difficultyPerformance;
        }

        private List<DetailedExamSummary.StudentPerformance> getTopPerformers(
                        List<ExamResult> results,
                        List<DetailedExamResult> detailedResults,
                        int topCount) {

                // Sort results by marks in descending order and take top performers
                List<ExamResult> topResults = results.stream()
                                .sorted(Comparator.comparing(ExamResult::getMarksObtained).reversed())
                                .limit(topCount)
                                .collect(Collectors.toList());

                // Group detailed results by student
                Map<Long, List<DetailedExamResult>> detailedResultsByStudent = detailedResults.stream()
                                .collect(Collectors.groupingBy(result -> result.getExamResult().getStudent().getId()));

                List<DetailedExamSummary.StudentPerformance> topPerformers = new ArrayList<>();

                for (ExamResult result : topResults) {
                        Student student = result.getStudent();
                        Double totalMarks = result.getExam().getTotalMarks();
                        Double percentage = (totalMarks > 0) ? (result.getMarksObtained() / totalMarks) * 100 : 0;

                        // Get chapter-wise performance for this student
                        List<DetailedExamResult> studentResults = detailedResultsByStudent.get(student.getId());
                        Map<String, Double> chapterPerformance = new HashMap<>();

                        if (studentResults != null) {                                Map<String, List<DetailedExamResult>> resultsByChapter = studentResults.stream()
                                                .filter(res -> res.getQuestion().getChapter() != null)
                                                .collect(Collectors.groupingBy(
                                                                res -> res.getQuestion().getChapter()));

                                for (Map.Entry<String, List<DetailedExamResult>> entry : resultsByChapter.entrySet()) {
                                        String chapterName = entry.getKey();

                                        double chapterMaxMarks = entry.getValue().stream()
                                                        .mapToDouble(res -> res.getQuestion().getMarks())
                                                        .sum();

                                        double chapterMarksObtained = entry.getValue().stream()
                                                        .mapToDouble(DetailedExamResult::getMarksObtained)
                                                        .sum();

                                        double chapterPercentage = (chapterMaxMarks > 0)
                                                        ? (chapterMarksObtained / chapterMaxMarks) * 100
                                                        : 0;
                                        chapterPerformance.put(chapterName,
                                                        Math.round(chapterPercentage * 100.0) / 100.0);
                                }
                        }

                        topPerformers.add(DetailedExamSummary.StudentPerformance.builder()
                                        .studentId(student.getId())
                                        .studentName(student.getFirstName() + " " + student.getLastName())
                                        .marksObtained(result.getMarksObtained())
                                        .percentage(Math.round(percentage * 100.0) / 100.0)
                                        .chapterWisePerformance(chapterPerformance)
                                        .build());
                }

                return topPerformers;
        }

        private List<DetailedExamSummary.QuestionPerformance> analyzeQuestions(
                        List<DetailedExamResult> detailedResults) {
                // Group by question
                Map<Long, List<DetailedExamResult>> resultsByQuestion = detailedResults.stream()
                                .collect(Collectors.groupingBy(result -> result.getQuestion().getId()));

                List<DetailedExamSummary.QuestionPerformance> questionAnalysis = new ArrayList<>();

                for (Map.Entry<Long, List<DetailedExamResult>> entry : resultsByQuestion.entrySet()) {
                        Question question = entry.getValue().get(0).getQuestion();
                        double maxMarks = question.getMarks();

                        DoubleSummaryStatistics stats = entry.getValue().stream()
                                        .mapToDouble(DetailedExamResult::getMarksObtained)
                                        .summaryStatistics();

                        long fullMarksCount = entry.getValue().stream()
                                        .filter(result -> result.getMarksObtained() >= maxMarks)
                                        .count();

                        long zeroMarksCount = entry.getValue().stream()
                                        .filter(result -> result.getMarksObtained() == 0)
                                        .count();

                        double scorePercentage = (maxMarks > 0) ? (stats.getAverage() / maxMarks) * 100 : 0;

                        questionAnalysis.add(DetailedExamSummary.QuestionPerformance.builder()
                                        .questionId(question.getId())
                                        .questionNumber(question.getQuestionNumber())
                                        .averageScore(stats.getAverage())
                                        .maxMarks(maxMarks)
                                        .scorePercentage(Math.round(scorePercentage * 100.0) / 100.0)
                                        .studentsAttempted(entry.getValue().size())
                                        .studentsGotFull((int) fullMarksCount)
                                        .studentsGotZero((int) zeroMarksCount)
                                        .build());
                }

                // Sort by question number for consistency
                questionAnalysis.sort(Comparator.comparing(DetailedExamSummary.QuestionPerformance::getQuestionNumber));

                return questionAnalysis;
        }
}
