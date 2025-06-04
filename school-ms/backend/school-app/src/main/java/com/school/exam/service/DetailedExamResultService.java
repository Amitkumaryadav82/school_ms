package com.school.exam.service;

import com.school.exam.model.DetailedExamResult;
import com.school.exam.model.ExamResult;
import com.school.exam.model.Question;
import com.school.exam.repository.DetailedExamResultRepository;
import com.school.exam.repository.ExamResultRepository;
import com.school.exam.repository.QuestionRepository;
import com.school.exam.dto.DetailedExamResultRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@Transactional
public class DetailedExamResultService {

    @Autowired
    private DetailedExamResultRepository detailedExamResultRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

    @Autowired
    private QuestionRepository questionRepository;

    public DetailedExamResult recordDetailedResult(DetailedExamResultRequest request) {
        ExamResult examResult = examResultRepository.findById(request.getExamResultId())
                .orElseThrow(() -> new RuntimeException("Exam result not found with id: " + request.getExamResultId()));

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + request.getQuestionId()));

        // Validate marks are not exceeding max marks for the question
        if (request.getMarksObtained() > question.getMarks()) {
            throw new RuntimeException("Marks obtained cannot exceed maximum marks for the question");
        }

        // Check if a result already exists for this question and exam result
        Optional<DetailedExamResult> existingResult = detailedExamResultRepository
                .findByExamResultIdAndQuestionId(request.getExamResultId(), request.getQuestionId());

        if (existingResult.isPresent()) {
            // If result is locked, only allowed users can update
            if (existingResult.get().getIsLocked() && !isAuthorizedToEditLockedResult()) {
                throw new RuntimeException("Result is locked and cannot be updated");
            }
            return updateDetailedResult(existingResult.get().getId(), request);
        }

        DetailedExamResult detailedResult = DetailedExamResult.builder()
                .examResult(examResult)
                .question(question)
                .marksObtained(request.getMarksObtained())
                .teacherRemarks(request.getTeacherRemarks())
                .isPartialMarking(request.getIsPartialMarking())
                .markedBy(getCurrentUserId())
                .markedAt(LocalDateTime.now())
                .isLocked(false)
                .isReviewed(false)
                .build();

        DetailedExamResult saved = detailedExamResultRepository.save(detailedResult);

        // Update the overall result with total marks
        updateOverallExamResult(examResult);

        return saved;
    }

    public DetailedExamResult updateDetailedResult(Long id, DetailedExamResultRequest request) {
        DetailedExamResult detailedResult = detailedExamResultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detailed exam result not found with id: " + id));

        // If result is locked, only allowed users can update
        if (detailedResult.getIsLocked() && !isAuthorizedToEditLockedResult()) {
            throw new RuntimeException("Result is locked and cannot be updated");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + request.getQuestionId()));

        // Validate marks are not exceeding max marks for the question
        if (request.getMarksObtained() > question.getMarks()) {
            throw new RuntimeException("Marks obtained cannot exceed maximum marks for the question");
        }

        detailedResult.setMarksObtained(request.getMarksObtained());
        detailedResult.setTeacherRemarks(request.getTeacherRemarks());
        detailedResult.setIsPartialMarking(request.getIsPartialMarking());
        detailedResult.setMarkedBy(getCurrentUserId());
        detailedResult.setMarkedAt(LocalDateTime.now());
        detailedResult.setIsReviewed(false); // Reset review status on update

        DetailedExamResult saved = detailedExamResultRepository.save(detailedResult);

        // Update the overall result with total marks
        updateOverallExamResult(detailedResult.getExamResult());

        return saved;
    }

    private void updateOverallExamResult(ExamResult examResult) {
        // Get all detailed results for this exam result
        List<DetailedExamResult> detailedResults = detailedExamResultRepository.findByExamResultId(examResult.getId());

        // Calculate total marks
        double totalMarks = detailedResults.stream()
                .mapToDouble(DetailedExamResult::getMarksObtained)
                .sum();

        examResult.setMarksObtained(totalMarks);
        examResultRepository.save(examResult);
    }

    public DetailedExamResult getDetailedResult(Long id) {
        return detailedExamResultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Detailed exam result not found with id: " + id));
    }

    public List<DetailedExamResult> getDetailedResultsByExamResult(Long examResultId) {
        return detailedExamResultRepository.findByExamResultId(examResultId);
    }

    public List<DetailedExamResult> getDetailedResultsByExam(Long examId) {
        return detailedExamResultRepository.findByExamId(examId);
    }

    public List<DetailedExamResult> getDetailedResultsByQuestion(Long questionId) {
        return detailedExamResultRepository.findByQuestionId(questionId);
    }

    public List<DetailedExamResult> getDetailedResultsByChapter(Long chapterId) {
        return detailedExamResultRepository.findByChapterId(chapterId);
    }

    public DetailedExamResult lockResult(Long id) {
        DetailedExamResult detailedResult = getDetailedResult(id);
        detailedResult.setIsLocked(true);
        detailedResult.setLockedBy(getCurrentUserId());
        detailedResult.setLockedAt(LocalDateTime.now());
        return detailedExamResultRepository.save(detailedResult);
    }

    public DetailedExamResult unlockResult(Long id) {
        DetailedExamResult detailedResult = getDetailedResult(id);

        if (!isAuthorizedToEditLockedResult()) {
            throw new RuntimeException("Not authorized to unlock results");
        }

        detailedResult.setIsLocked(false);
        return detailedExamResultRepository.save(detailedResult);
    }

    public DetailedExamResult reviewResult(Long id) {
        DetailedExamResult detailedResult = getDetailedResult(id);
        detailedResult.setIsReviewed(true);
        detailedResult.setReviewedBy(getCurrentUserId());
        detailedResult.setReviewedAt(LocalDateTime.now());
        return detailedExamResultRepository.save(detailedResult);
    }

    public void lockAllResultsForExam(Long examId) {
        List<DetailedExamResult> results = detailedExamResultRepository.findByExamId(examId);
        Long userId = getCurrentUserId();
        LocalDateTime now = LocalDateTime.now();

        results.forEach(result -> {
            result.setIsLocked(true);
            result.setLockedBy(userId);
            result.setLockedAt(now);
        });

        detailedExamResultRepository.saveAll(results);
    }

    // Method to check if a user is authorized to edit locked results (HOD,
    // Principal)
    private boolean isAuthorizedToEditLockedResult() {
        // Implementation will depend on your security model
        // Here's a simple example that checks for admin role
        return hasRole("ROLE_HOD") || hasRole("ROLE_PRINCIPAL") || hasRole("ROLE_ADMIN");
    }

    private boolean hasRole(String role) {
        try {
            return SecurityContextHolder.getContext().getAuthentication()
                    .getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals(role));
        } catch (Exception e) {
            return false;
        }
    }

    private Long getCurrentUserId() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof UserDetails) {
                return Long.parseLong(((UserDetails) principal).getUsername());
            }
            // Default to admin if not authenticated (for development)
            return 1L;
        } catch (Exception e) {
            // Default to admin if not authenticated (for development)
            return 1L;
        }
    }
}
