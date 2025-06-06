package com.school.exam.service;

import com.school.exam.model.ExamBlueprint;
import com.school.exam.model.ExamConfiguration;
import com.school.exam.model.ChapterDistribution;
import com.school.exam.model.QuestionPaperStructure;
import com.school.exam.repository.ExamBlueprintRepository;
import com.school.exam.repository.ChapterDistributionRepository;
import com.school.exam.dto.ExamBlueprintRequest;
import com.school.exam.dto.ChapterDistributionRequest;
import com.school.exam.exception.BlueprintNotFoundException;
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
public class BlueprintService {

    @Autowired
    private ExamBlueprintRepository blueprintRepository;

    @Autowired
    private ChapterDistributionRepository chapterDistributionRepository;

    @Autowired
    private ExamConfigurationService examConfigurationService;

    @Autowired
    private ChapterService chapterService;

    public ExamBlueprint createBlueprint(ExamBlueprintRequest request) {
        ExamConfiguration examConfig = examConfigurationService.getExamConfiguration(request.getExamConfigurationId());

        QuestionPaperStructure paperStructure = examConfig.getQuestionPaperStructure();
        if (paperStructure == null) {
            throw new RuntimeException("Exam configuration does not have a question paper structure");
        }

        ExamBlueprint blueprint = ExamBlueprint.builder()
                .name(request.getName())
                .description(request.getDescription())
                .examConfiguration(examConfig)
                .paperStructure(paperStructure)
                .isApproved(false)
                .approvedBy(getCurrentUserId())
                .approvalDate(LocalDateTime.now())
                .comments(request.getComments())
                .chapterDistributions(new ArrayList<>())
                .build();

        ExamBlueprint savedBlueprint = blueprintRepository.save(blueprint);

        // Create chapter distributions if provided
        if (request.getChapterDistributions() != null && !request.getChapterDistributions().isEmpty()) {
            List<ChapterDistribution> distributions = request.getChapterDistributions().stream()
                    .map(distRequest -> createChapterDistribution(distRequest, savedBlueprint))
                    .collect(Collectors.toList());
            savedBlueprint.setChapterDistributions(distributions);
        }

        return blueprintRepository.save(savedBlueprint);
    }    private ChapterDistribution createChapterDistribution(ChapterDistributionRequest request, ExamBlueprint blueprint) {
        Chapter chapter = chapterService.getChapter(request.getChapterId());

        ChapterDistribution distribution = ChapterDistribution.builder()
                .blueprint(blueprint)
                .chapterName(chapter.getName())
                .questionType(request.getQuestionType())
                .questionCount(request.getQuestionCount())
                .totalMarks(request.getTotalMarks())
                .weightagePercentage(request.getWeightagePercentage())
                .build();
        
        distribution.setChapter(chapter);
        return distribution;
    }

    public ExamBlueprint updateBlueprint(Long id, ExamBlueprintRequest request) {
        ExamBlueprint blueprint = getBlueprint(id);

        if (blueprint.getIsApproved()) {
            throw new RuntimeException("Cannot update an approved blueprint");
        }

        blueprint.setName(request.getName());
        blueprint.setDescription(request.getDescription());
        blueprint.setComments(request.getComments());

        // Update chapter distributions if provided
        if (request.getChapterDistributions() != null) {
            // Remove existing distributions not in the request
            if (blueprint.getChapterDistributions() != null) {                List<ChapterDistribution> distributionsToRemove = blueprint.getChapterDistributions().stream()
                        .filter(dist -> !request.getChapterDistributions().stream()
                                .filter(req -> req.getChapterId().equals(chapterService.getChapterByName(dist.getChapterName()).getId()) &&
                                        req.getQuestionType().equals(dist.getQuestionType()))
                                .findAny()
                                .isPresent())
                        .collect(Collectors.toList());

                distributionsToRemove.forEach(dist -> {
                    blueprint.getChapterDistributions().remove(dist);
                    chapterDistributionRepository.delete(dist);
                });

                // Update existing distributions
                for (ChapterDistributionRequest distRequest : request.getChapterDistributions()) {
                    boolean distExists = false;                    for (ChapterDistribution existingDist : blueprint.getChapterDistributions()) {
                        Chapter chapter = chapterService.getChapterByName(existingDist.getChapterName());
                        if (chapter != null && chapter.getId().equals(distRequest.getChapterId()) &&
                                existingDist.getQuestionType().equals(distRequest.getQuestionType())) {
                            existingDist.setQuestionCount(distRequest.getQuestionCount());
                            existingDist.setTotalMarks(distRequest.getTotalMarks());
                            existingDist.setWeightagePercentage(distRequest.getWeightagePercentage());
                            distExists = true;
                            break;
                        }
                    }

                    // Add new distribution if it doesn't exist
                    if (!distExists) {
                        ChapterDistribution newDist = createChapterDistribution(distRequest, blueprint);
                        blueprint.getChapterDistributions().add(newDist);
                    }
                }
            } else {
                // Create all distributions if none exist
                List<ChapterDistribution> distributions = request.getChapterDistributions().stream()
                        .map(distRequest -> createChapterDistribution(distRequest, blueprint))
                        .collect(Collectors.toList());
                blueprint.setChapterDistributions(distributions);
            }
        }

        return blueprintRepository.save(blueprint);
    }

    public ExamBlueprint getBlueprint(Long id) {
        return blueprintRepository.findById(id)
                .orElseThrow(() -> new BlueprintNotFoundException("Blueprint not found with id: " + id));
    }

    public List<ExamBlueprint> getAllBlueprints() {
        return blueprintRepository.findAll();
    }

    public List<ExamBlueprint> getBlueprintsByExamConfiguration(Long examConfigId) {
        return blueprintRepository.findByExamConfigurationId(examConfigId);
    }

    public List<ExamBlueprint> getApprovedBlueprints() {
        return blueprintRepository.findByIsApproved(true);
    }

    public void deleteBlueprint(Long id) {
        ExamBlueprint blueprint = getBlueprint(id);

        if (blueprint.getIsApproved()) {
            throw new RuntimeException("Cannot delete an approved blueprint");
        }

        blueprintRepository.deleteById(id);
    }

    public ExamBlueprint approveBlueprint(Long id) {
        ExamBlueprint blueprint = getBlueprint(id);
        blueprint.setIsApproved(true);
        blueprint.setApprovedBy(getCurrentUserId());
        blueprint.setApprovalDate(LocalDateTime.now());
        return blueprintRepository.save(blueprint);
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
