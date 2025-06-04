package com.school.exam.service;

import com.school.exam.model.ExamConfiguration;
import com.school.exam.model.QuestionPaperStructure;
import com.school.exam.model.QuestionSection;
import com.school.exam.repository.ExamConfigurationRepository;
import com.school.exam.repository.QuestionPaperStructureRepository;
import com.school.exam.repository.QuestionSectionRepository;
import com.school.exam.dto.ExamConfigurationRequest;
import com.school.exam.dto.QuestionPaperStructureRequest;
import com.school.exam.dto.QuestionSectionRequest;
import com.school.exam.exception.ExamConfigurationNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExamConfigurationService {

    @Autowired
    private ExamConfigurationRepository examConfigurationRepository;

    @Autowired
    private QuestionPaperStructureRepository questionPaperStructureRepository;

    @Autowired
    private QuestionSectionRepository questionSectionRepository;

    public ExamConfiguration createExamConfiguration(ExamConfigurationRequest request) {
        ExamConfiguration config = ExamConfiguration.builder()
                .name(request.getName())
                .subject(request.getSubject())
                .grade(request.getGrade())
                .theoryMaxMarks(request.getTheoryMaxMarks())
                .practicalMaxMarks(request.getPracticalMaxMarks())
                .passingPercentage(request.getPassingPercentage())
                .examType(request.getExamType())
                .description(request.getDescription())
                .isActive(request.getIsActive())
                .requiresApproval(request.getRequiresApproval())
                .approvalStatus(ExamConfiguration.ApprovalStatus.PENDING)
                .academicYear(request.getAcademicYear())
                .build();

        examConfigurationRepository.save(config);

        // Create question paper structure if provided
        if (request.getPaperStructure() != null) {
            QuestionPaperStructure paperStructure = createPaperStructure(request.getPaperStructure(), config);
            config.setQuestionPaperStructure(paperStructure);
        }

        return examConfigurationRepository.save(config);
    }

    private QuestionPaperStructure createPaperStructure(QuestionPaperStructureRequest request,
            ExamConfiguration config) {
        QuestionPaperStructure structure = QuestionPaperStructure.builder()
                .name(request.getName())
                .totalQuestions(request.getTotalQuestions())
                .mandatoryQuestions(request.getMandatoryQuestions())
                .optionalQuestions(request.getOptionalQuestions())
                .totalMarks(request.getTotalMarks())
                .examConfiguration(config)
                .sections(new ArrayList<>())
                .build();

        QuestionPaperStructure savedStructure = questionPaperStructureRepository.save(structure);

        // Create sections if provided
        if (request.getSections() != null && !request.getSections().isEmpty()) {
            List<QuestionSection> sections = request.getSections().stream()
                    .map(sectionRequest -> createQuestionSection(sectionRequest, savedStructure))
                    .collect(Collectors.toList());
            savedStructure.setSections(sections);
        }

        return savedStructure;
    }

    private QuestionSection createQuestionSection(QuestionSectionRequest request, QuestionPaperStructure structure) {
        QuestionSection section = QuestionSection.builder()
                .sectionName(request.getSectionName())
                .questionCount(request.getQuestionCount())
                .marksPerQuestion(request.getMarksPerQuestion())
                .isMandatory(request.getIsMandatory())
                .questionType(request.getQuestionType())
                .questionPaperStructure(structure)
                .build();

        return questionSectionRepository.save(section);
    }

    public ExamConfiguration updateExamConfiguration(Long id, ExamConfigurationRequest request) {
        ExamConfiguration config = getExamConfiguration(id);
        config.setName(request.getName());
        config.setSubject(request.getSubject());
        config.setGrade(request.getGrade());
        config.setTheoryMaxMarks(request.getTheoryMaxMarks());
        config.setPracticalMaxMarks(request.getPracticalMaxMarks());
        config.setPassingPercentage(request.getPassingPercentage());
        config.setExamType(request.getExamType());
        config.setDescription(request.getDescription());
        config.setIsActive(request.getIsActive());
        config.setRequiresApproval(request.getRequiresApproval());
        config.setAcademicYear(request.getAcademicYear());

        // Update paper structure if provided
        if (request.getPaperStructure() != null) {
            if (config.getQuestionPaperStructure() != null) {
                updatePaperStructure(config.getQuestionPaperStructure().getId(), request.getPaperStructure());
            } else {
                QuestionPaperStructure paperStructure = createPaperStructure(request.getPaperStructure(), config);
                config.setQuestionPaperStructure(paperStructure);
            }
        }

        return examConfigurationRepository.save(config);
    }

    private void updatePaperStructure(Long structureId, QuestionPaperStructureRequest request) {
        QuestionPaperStructure structure = questionPaperStructureRepository.findById(structureId)
                .orElseThrow(() -> new RuntimeException("Question paper structure not found"));

        structure.setName(request.getName());
        structure.setTotalQuestions(request.getTotalQuestions());
        structure.setMandatoryQuestions(request.getMandatoryQuestions());
        structure.setOptionalQuestions(request.getOptionalQuestions());
        structure.setTotalMarks(request.getTotalMarks());

        // Update existing sections and add new ones
        if (request.getSections() != null) {
            // Remove existing sections not in the request
            if (structure.getSections() != null) {
                List<QuestionSection> sectionsToRemove = structure.getSections().stream()
                        .filter(section -> !request.getSections().stream()
                                .filter(req -> req.getSectionName().equals(section.getSectionName()))
                                .findAny()
                                .isPresent())
                        .collect(Collectors.toList());

                sectionsToRemove.forEach(section -> {
                    structure.getSections().remove(section);
                    questionSectionRepository.delete(section);
                });

                // Update existing sections
                for (QuestionSectionRequest sectionRequest : request.getSections()) {
                    boolean sectionExists = false;
                    for (QuestionSection existingSection : structure.getSections()) {
                        if (existingSection.getSectionName().equals(sectionRequest.getSectionName())) {
                            existingSection.setQuestionCount(sectionRequest.getQuestionCount());
                            existingSection.setMarksPerQuestion(sectionRequest.getMarksPerQuestion());
                            existingSection.setIsMandatory(sectionRequest.getIsMandatory());
                            existingSection.setQuestionType(sectionRequest.getQuestionType());
                            sectionExists = true;
                            break;
                        }
                    }

                    // Add new section if it doesn't exist
                    if (!sectionExists) {
                        QuestionSection newSection = createQuestionSection(sectionRequest, structure);
                        structure.getSections().add(newSection);
                    }
                }
            } else {
                // Create all sections if none exist
                List<QuestionSection> sections = request.getSections().stream()
                        .map(sectionRequest -> createQuestionSection(sectionRequest, structure))
                        .collect(Collectors.toList());
                structure.setSections(sections);
            }
        }

        questionPaperStructureRepository.save(structure);
    }

    public ExamConfiguration getExamConfiguration(Long id) {
        return examConfigurationRepository.findById(id)
                .orElseThrow(
                        () -> new ExamConfigurationNotFoundException("Exam configuration not found with id: " + id));
    }

    public List<ExamConfiguration> getAllExamConfigurations() {
        return examConfigurationRepository.findAll();
    }

    public List<ExamConfiguration> getExamConfigurationsByGrade(Integer grade) {
        return examConfigurationRepository.findByGrade(grade);
    }    public List<ExamConfiguration> getExamConfigurationsBySubject(String subject) {
        return examConfigurationRepository.findBySubject(subject);
    }

    public List<ExamConfiguration> getExamConfigurationsByExamType(Exam.ExamType examType) {
        return examConfigurationRepository.findByExamType(examType);
    }

    public List<ExamConfiguration> getActiveExamConfigurations() {
        return examConfigurationRepository.findByIsActive(true);
    }

    public List<ExamConfiguration> getExamConfigurationsByAcademicYear(Integer academicYear) {
        return examConfigurationRepository.findByAcademicYear(academicYear);
    }

    public void deleteExamConfiguration(Long id) {
        examConfigurationRepository.deleteById(id);
    }

    public ExamConfiguration approveExamConfiguration(Long id) {
        ExamConfiguration config = getExamConfiguration(id);
        config.setApprovalStatus(ExamConfiguration.ApprovalStatus.APPROVED);
        return examConfigurationRepository.save(config);
    }

    public ExamConfiguration rejectExamConfiguration(Long id) {
        ExamConfiguration config = getExamConfiguration(id);
        config.setApprovalStatus(ExamConfiguration.ApprovalStatus.REJECTED);
        return examConfigurationRepository.save(config);
    }
}
