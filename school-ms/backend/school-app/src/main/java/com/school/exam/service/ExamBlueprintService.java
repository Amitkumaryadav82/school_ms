package com.school.exam.service;

import com.school.exam.dto.ExamBlueprintDTO;
import java.util.List;

/**
 * Service interface for managing exam blueprints
 */
public interface ExamBlueprintService {
    
    /**
     * Create a new exam blueprint
     * @param blueprintDTO the blueprint to create
     * @return the created blueprint
     */
    ExamBlueprintDTO createBlueprint(ExamBlueprintDTO blueprintDTO);
    
    /**
     * Update an existing exam blueprint
     * @param id the blueprint id
     * @param blueprintDTO the updated blueprint data
     * @return the updated blueprint
     */
    ExamBlueprintDTO updateBlueprint(Long id, ExamBlueprintDTO blueprintDTO);
    
    /**
     * Get an exam blueprint by id
     * @param id the blueprint id
     * @return the blueprint
     */
    ExamBlueprintDTO getBlueprintById(Long id);
    
    /**
     * Get all blueprints for an exam
     * @param examId the exam id
     * @return list of blueprints
     */
    List<ExamBlueprintDTO> getBlueprintsByExamId(Long examId);
    
    /**
     * Validate an exam blueprint against a question paper
     * @param blueprintId the blueprint id
     * @param questionPaperId the question paper id
     * @return validation results
     */
    ExamBlueprintDTO.BlueprintValidationResult validateBlueprint(Long blueprintId, Long questionPaperId);
    
    /**
     * Approve an exam blueprint
     * @param id the blueprint id
     * @param approvedBy the user id who approved
     * @return the approved blueprint
     */
    ExamBlueprintDTO approveBlueprint(Long id, Long approvedBy);
    
    /**
     * Delete an exam blueprint
     * @param id the blueprint id
     */
    void deleteBlueprint(Long id);
}
