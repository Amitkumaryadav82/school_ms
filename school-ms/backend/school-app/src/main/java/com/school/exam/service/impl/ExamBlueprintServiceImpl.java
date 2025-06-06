package com.school.exam.service.impl;

import com.school.exam.dto.ExamBlueprintDTO;
import com.school.exam.model.*;
import com.school.exam.repository.ExamBlueprintRepository;
import com.school.exam.repository.ExamConfigurationRepository;
import com.school.exam.repository.QuestionPaperRepository;
import com.school.exam.repository.QuestionRepository;
import com.school.exam.repository.ChapterDistributionRepository;
import com.school.exam.service.ExamBlueprintService;
import com.school.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamBlueprintServiceImpl implements ExamBlueprintService {

    private final ExamBlueprintRepository blueprintRepository;
    private final ExamConfigurationRepository configRepository;
    private final QuestionPaperRepository paperRepository;
    private final QuestionRepository questionRepository;
    private final ChapterDistributionRepository chapterDistributionRepository;

    @Autowired
    public ExamBlueprintServiceImpl(
            ExamBlueprintRepository blueprintRepository,
            ExamConfigurationRepository configRepository,
            QuestionPaperRepository paperRepository,
            QuestionRepository questionRepository,
            ChapterDistributionRepository chapterDistributionRepository) {
        this.blueprintRepository = blueprintRepository;
        this.configRepository = configRepository;
        this.paperRepository = paperRepository;
        this.questionRepository = questionRepository;
        this.chapterDistributionRepository = chapterDistributionRepository;
    }

    @Override
    @Transactional
    public ExamBlueprintDTO createBlueprint(ExamBlueprintDTO blueprintDTO) {
        ExamConfiguration examConfig = configRepository.findById(blueprintDTO.getExamConfigurationId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam Configuration not found"));

        ExamBlueprint blueprint = ExamBlueprint.builder()
                .name(blueprintDTO.getName())
                .description(blueprintDTO.getDescription())
                .examConfiguration(examConfig)
                .paperStructure(examConfig.getQuestionPaperStructure())
                .isApproved(false)
                .build();

        ExamBlueprint savedBlueprint = blueprintRepository.save(blueprint);
        
        // Create chapter distributions
        List<ChapterDistribution> distributions = blueprintDTO.getChapterDistributions().stream()
                .flatMap(chapterDto -> {
                    return chapterDto.getSectionDistributions().stream().map(sectionDto -> {
                        return ChapterDistribution.builder()
                                .blueprint(savedBlueprint)
                                .chapterName(chapterDto.getChapterName())
                                .questionType(QuestionSection.QuestionType.valueOf(sectionDto.getQuestionType()))
                                .questionCount(sectionDto.getQuestionCount())
                                .totalMarks(sectionDto.getTotalMarks())
                                .weightagePercentage(sectionDto.getTotalMarks() / examConfig.getQuestionPaperStructure().getTotalMarks() * 100)
                                .build();
                    });
                })
                .collect(Collectors.toList());
        
        chapterDistributionRepository.saveAll(distributions);
        savedBlueprint.setChapterDistributions(distributions);
        
        return mapToDTO(savedBlueprint);
    }

    @Override
    @Transactional
    public ExamBlueprintDTO updateBlueprint(Long id, ExamBlueprintDTO blueprintDTO) {
        ExamBlueprint blueprint = blueprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blueprint not found"));
        
        // Only allow updates if not approved
        if (blueprint.getIsApproved()) {
            throw new IllegalStateException("Cannot update an approved blueprint");
        }
        
        blueprint.setName(blueprintDTO.getName());
        blueprint.setDescription(blueprintDTO.getDescription());
        
        // Delete existing chapter distributions
        chapterDistributionRepository.deleteAll(blueprint.getChapterDistributions());
        
        // Create new chapter distributions
        List<ChapterDistribution> distributions = blueprintDTO.getChapterDistributions().stream()
                .flatMap(chapterDto -> {
                    return chapterDto.getSectionDistributions().stream().map(sectionDto -> {
                        return ChapterDistribution.builder()
                                .blueprint(blueprint)
                                .chapterName(chapterDto.getChapterName())
                                .questionType(QuestionSection.QuestionType.valueOf(sectionDto.getQuestionType()))
                                .questionCount(sectionDto.getQuestionCount())
                                .totalMarks(sectionDto.getTotalMarks())
                                .weightagePercentage(sectionDto.getTotalMarks() / blueprint.getPaperStructure().getTotalMarks() * 100)
                                .build();
                    });
                })
                .collect(Collectors.toList());
        
        chapterDistributionRepository.saveAll(distributions);
        blueprint.setChapterDistributions(distributions);
        
        return mapToDTO(blueprintRepository.save(blueprint));
    }

    @Override
    public ExamBlueprintDTO getBlueprintById(Long id) {
        ExamBlueprint blueprint = blueprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blueprint not found"));
        return mapToDTO(blueprint);
    }

    @Override
    public List<ExamBlueprintDTO> getBlueprintsByExamId(Long examId) {
        List<ExamBlueprint> blueprints = blueprintRepository.findByExamConfigurationExamId(examId);
        return blueprints.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ExamBlueprintDTO.BlueprintValidationResult validateBlueprint(Long blueprintId, Long questionPaperId) {
        ExamBlueprint blueprint = blueprintRepository.findById(blueprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Blueprint not found"));
        
        QuestionPaper paper = paperRepository.findById(questionPaperId)
                .orElseThrow(() -> new ResourceNotFoundException("Question paper not found"));
        
        List<Question> questions = questionRepository.findByQuestionPaperId(questionPaperId);
        
        // Group questions by chapter and type for validation
        Map<String, Map<QuestionSection.QuestionType, List<Question>>> questionsByChapterAndType = questions.stream()
                .collect(Collectors.groupingBy(
                    Question::getChapterName,
                    Collectors.groupingBy(Question::getQuestionType)
                ));
        
        List<ExamBlueprintDTO.BlueprintValidationResult.ValidationIssue> issues = new ArrayList<>();
        
        // Validate each chapter distribution
        for (ChapterDistribution distribution : blueprint.getChapterDistributions()) {
            String chapterName = distribution.getChapterName();
            QuestionSection.QuestionType questionType = distribution.getQuestionType();
            
            // Check if chapter exists in question paper
            if (!questionsByChapterAndType.containsKey(chapterName)) {
                issues.add(new ExamBlueprintDTO.BlueprintValidationResult.ValidationIssue(
                    chapterName,
                    questionType.name(),
                    "Chapter not found in question paper",
                    ExamBlueprintDTO.BlueprintValidationResult.ValidationIssue.ValidationSeverity.ERROR
                ));
                continue;
            }
            
            // Check if question type exists for this chapter
            Map<QuestionSection.QuestionType, List<Question>> typeMap = questionsByChapterAndType.get(chapterName);
            if (!typeMap.containsKey(questionType)) {                issues.add(new ExamBlueprintDTO.BlueprintValidationResult.ValidationIssue(
                    chapterName,
                    questionType.name(),
                    "No questions of type " + questionType + " for chapter " + chapterName,
                    ExamBlueprintDTO.BlueprintValidationResult.ValidationIssue.ValidationSeverity.ERROR
                ));
                continue;
            }
            
            // Check question count
            List<Question> chapterQuestions = typeMap.get(questionType);
            if (chapterQuestions.size() != distribution.getQuestionCount()) {
                issues.add(new ExamBlueprintDTO.BlueprintValidationResult.ValidationIssue(
                    chapterName,
                    questionType.name(),
                    "Expected " + distribution.getQuestionCount() + " questions but found " + chapterQuestions.size(),
                    ExamBlueprintDTO.BlueprintValidationResult.ValidationIssue.ValidationSeverity.ERROR
                ));
            }
            
            // Check total marks
            double totalMarks = chapterQuestions.stream().mapToDouble(Question::getMarks).sum();
            if (Math.abs(totalMarks - distribution.getTotalMarks()) > 0.01) {
                issues.add(new ExamBlueprintDTO.BlueprintValidationResult.ValidationIssue(
                    chapterName,
                    questionType.name(),
                    "Expected " + distribution.getTotalMarks() + " total marks but found " + totalMarks,
                    ExamBlueprintDTO.BlueprintValidationResult.ValidationIssue.ValidationSeverity.WARNING
                ));
            }
        }
        
        return new ExamBlueprintDTO.BlueprintValidationResult(issues.isEmpty(), issues);
    }

    @Override
    @Transactional
    public ExamBlueprintDTO approveBlueprint(Long id, Long approvedBy) {
        ExamBlueprint blueprint = blueprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blueprint not found"));
        
        blueprint.setIsApproved(true);
        blueprint.setApprovedBy(approvedBy);
        blueprint.setApprovalDate(LocalDateTime.now());
        
        return mapToDTO(blueprintRepository.save(blueprint));
    }

    @Override
    @Transactional
    public void deleteBlueprint(Long id) {
        ExamBlueprint blueprint = blueprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blueprint not found"));
        
        if (blueprint.getIsApproved()) {
            throw new IllegalStateException("Cannot delete an approved blueprint");
        }
        
        blueprintRepository.delete(blueprint);
    }
    
    // Helper methods to map between entities and DTOs
    private ExamBlueprintDTO mapToDTO(ExamBlueprint blueprint) {
        // Group chapter distributions by chapter name
        Map<String, List<ChapterDistribution>> distributionsByChapter = blueprint.getChapterDistributions().stream()
                .collect(Collectors.groupingBy(ChapterDistribution::getChapterName));
        
        List<ExamBlueprintDTO.ChapterDistributionDTO> chapterDTOs = new ArrayList<>();
        
        for (Map.Entry<String, List<ChapterDistribution>> entry : distributionsByChapter.entrySet()) {
            String chapterName = entry.getKey();
            List<ChapterDistribution> distributions = entry.getValue();
            
            List<ExamBlueprintDTO.SectionDistribution> sectionDTOs = distributions.stream()
                    .map(dist -> new ExamBlueprintDTO.SectionDistribution(
                            getSectionNameForQuestionType(dist.getQuestionType()),
                            dist.getQuestionType().name(),
                            dist.getQuestionCount(),
                            dist.getTotalMarks() / dist.getQuestionCount(),
                            dist.getTotalMarks()
                    ))
                    .collect(Collectors.toList());
            
            double totalMarks = distributions.stream().mapToDouble(ChapterDistribution::getTotalMarks).sum();
            double weightage = distributions.stream().mapToDouble(ChapterDistribution::getWeightagePercentage).sum();
            
            chapterDTOs.add(new ExamBlueprintDTO.ChapterDistributionDTO(
                    chapterName,
                    sectionDTOs,
                    totalMarks,
                    weightage
            ));
        }
        
        return ExamBlueprintDTO.builder()
                .examId(blueprint.getExamConfiguration().getExamConfiguration().getId())
                .examConfigurationId(blueprint.getExamConfiguration().getId())
                .name(blueprint.getName())
                .description(blueprint.getDescription())
                .chapterDistributions(chapterDTOs)
                .build();
    }
    
    private String getSectionNameForQuestionType(QuestionSection.QuestionType type) {
        switch (type) {
            case MULTIPLE_CHOICE:
                return "Multiple Choice Questions";
            case SHORT_ANSWER:
                return "Short Answer Questions";
            case LONG_ANSWER:
                return "Long Answer Questions";
            case TRUE_FALSE:
                return "True/False Questions";
            case FILL_IN_BLANKS:
                return "Fill in the Blanks";
            case PRACTICAL:
                return "Practical Questions";
            default:
                return "Unknown";
        }
    }
}
