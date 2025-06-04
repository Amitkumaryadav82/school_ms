package com.school.exam.service;

import com.school.exam.model.QuestionPaper;
import com.school.exam.model.Question;
import com.school.exam.model.Exam;
import com.school.exam.model.ExamBlueprint;
import com.school.exam.repository.QuestionPaperRepository;
import com.school.exam.repository.QuestionRepository;
import com.school.exam.dto.QuestionPaperRequest;
import com.school.exam.dto.QuestionRequest;
import com.school.exam.exception.QuestionPaperNotFoundException;
import com.school.course.service.ChapterService;
import com.school.course.model.Chapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuestionPaperService {

    @Autowired
    private QuestionPaperRepository questionPaperRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamService examService;

    @Autowired
    private BlueprintService blueprintService;

    @Autowired
    private ChapterService chapterService;

    public QuestionPaper createQuestionPaper(QuestionPaperRequest request) {
        Exam exam = examService.getExam(request.getExamId());

        ExamBlueprint blueprint = null;
        if (request.getBlueprintId() != null) {
            blueprint = blueprintService.getBlueprint(request.getBlueprintId());
        }

        QuestionPaper paper = QuestionPaper.builder()
                .title(request.getTitle())
                .exam(exam)
                .blueprint(blueprint)
                .createdBy(getCurrentUserId())
                .approvalStatus(QuestionPaper.ApprovalStatus.PENDING)
                .timeAllotted(request.getTimeAllotted())
                .comments(request.getComments())
                .questions(new ArrayList<>())
                .build();

        QuestionPaper savedPaper = questionPaperRepository.save(paper);

        // Create questions if provided
        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            List<Question> questions = request.getQuestions().stream()
                    .map(questionRequest -> createQuestion(questionRequest, savedPaper))
                    .collect(Collectors.toList());
            savedPaper.setQuestions(questions);
        }

        return questionPaperRepository.save(savedPaper);
    }    private Question createQuestion(QuestionRequest request, QuestionPaper paper) {
        String chapterName = request.getChapterName();
        if (chapterName == null && request.getChapterId() != null) {
            try {
                chapterName = chapterService.getChapter(request.getChapterId()).getName();
            } catch (Exception e) {
                chapterName = "Unknown Chapter";
            }
        }        return Question.builder()
                .questionText(request.getQuestionText())
                .questionPaper(paper)
                .chapterName(chapterName)
                .marks(request.getMarks())
                .questionType(request.getQuestionType())
                .sectionNumber(request.getSectionNumber())
                .questionNumber(request.getQuestionNumber())
                .isCompulsory(request.getIsCompulsory())
                .answerKey(request.getAnswerKey())
                .markingScheme(request.getMarkingScheme())
                .build();
    }

    public QuestionPaper updateQuestionPaper(Long id, QuestionPaperRequest request) {
        QuestionPaper paper = getQuestionPaper(id);

        if (paper.getApprovalStatus() == QuestionPaper.ApprovalStatus.APPROVED) {
            throw new RuntimeException("Cannot update an approved question paper");
        }

        paper.setTitle(request.getTitle());
        paper.setTimeAllotted(request.getTimeAllotted());
        paper.setComments(request.getComments());

        // Update blueprint if provided
        if (request.getBlueprintId() != null) {
            ExamBlueprint blueprint = blueprintService.getBlueprint(request.getBlueprintId());
            paper.setBlueprint(blueprint);
        }

        // Update questions if provided
        if (request.getQuestions() != null) {
            // Remove existing questions not in the request
            if (paper.getQuestions() != null) {
                List<Question> questionsToRemove = paper.getQuestions().stream()
                        .filter(q -> !request.getQuestions().stream()
                                .filter(req -> req.getQuestionNumber().equals(q.getQuestionNumber()) &&
                                        req.getSectionNumber().equals(q.getSectionNumber()))
                                .findAny()
                                .isPresent())
                        .collect(Collectors.toList());

                questionsToRemove.forEach(q -> {
                    paper.getQuestions().remove(q);
                    questionRepository.delete(q);
                });

                // Update existing questions
                for (QuestionRequest questionRequest : request.getQuestions()) {
                    boolean questionExists = false;
                    for (Question existingQuestion : paper.getQuestions()) {
                        if (existingQuestion.getQuestionNumber().equals(questionRequest.getQuestionNumber()) &&
                                existingQuestion.getSectionNumber().equals(questionRequest.getSectionNumber())) {

                            existingQuestion.setQuestionText(questionRequest.getQuestionText());

                            if (questionRequest.getChapterId() != null) {
                                Chapter chapter = chapterService.getChapter(questionRequest.getChapterId());
                                existingQuestion.setChapter(chapter);
                            }

                            existingQuestion.setMarks(questionRequest.getMarks());
                            existingQuestion.setQuestionType(questionRequest.getQuestionType());
                            existingQuestion.setIsCompulsory(questionRequest.getIsCompulsory());
                            existingQuestion.setAnswerKey(questionRequest.getAnswerKey());
                            existingQuestion.setMarkingScheme(questionRequest.getMarkingScheme());

                            questionExists = true;
                            break;
                        }
                    }

                    // Add new question if it doesn't exist
                    if (!questionExists) {
                        Question newQuestion = createQuestion(questionRequest, paper);
                        paper.getQuestions().add(newQuestion);
                    }
                }
            } else {
                // Create all questions if none exist
                List<Question> questions = request.getQuestions().stream()
                        .map(questionRequest -> createQuestion(questionRequest, paper))
                        .collect(Collectors.toList());
                paper.setQuestions(questions);
            }
        }

        return questionPaperRepository.save(paper);
    }

    public QuestionPaper getQuestionPaper(Long id) {
        return questionPaperRepository.findById(id)
                .orElseThrow(() -> new QuestionPaperNotFoundException("Question paper not found with id: " + id));
    }

    public List<QuestionPaper> getAllQuestionPapers() {
        return questionPaperRepository.findAll();
    }

    public List<QuestionPaper> getQuestionPapersByExam(Long examId) {
        return questionPaperRepository.findByExamId(examId);
    }

    public List<QuestionPaper> getQuestionPapersByBlueprint(Long blueprintId) {
        return questionPaperRepository.findByBlueprintId(blueprintId);
    }

    public List<QuestionPaper> getQuestionPapersByCreator(Long creatorId) {
        return questionPaperRepository.findByCreatedBy(creatorId);
    }

    public List<QuestionPaper> getPendingApprovalQuestionPapers() {
        return questionPaperRepository.findByApprovalStatus(QuestionPaper.ApprovalStatus.PENDING);
    }

    public List<QuestionPaper> getApprovedQuestionPapers() {
        return questionPaperRepository.findByApprovalStatus(QuestionPaper.ApprovalStatus.APPROVED);
    }

    public void deleteQuestionPaper(Long id) {
        QuestionPaper paper = getQuestionPaper(id);

        if (paper.getApprovalStatus() == QuestionPaper.ApprovalStatus.APPROVED) {
            throw new RuntimeException("Cannot delete an approved question paper");
        }

        questionPaperRepository.deleteById(id);
    }

    public QuestionPaper approveQuestionPaper(Long id, String comments) {
        QuestionPaper paper = getQuestionPaper(id);
        paper.setApprovalStatus(QuestionPaper.ApprovalStatus.APPROVED);
        paper.setApprovedBy(getCurrentUserId());
        paper.setApprovalDate(LocalDateTime.now());
        if (comments != null) {
            paper.setComments(comments);
        }
        return questionPaperRepository.save(paper);
    }

    public QuestionPaper rejectQuestionPaper(Long id, String comments) {
        QuestionPaper paper = getQuestionPaper(id);
        paper.setApprovalStatus(QuestionPaper.ApprovalStatus.REJECTED);
        if (comments != null) {
            paper.setComments(comments);
        }
        return questionPaperRepository.save(paper);
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
