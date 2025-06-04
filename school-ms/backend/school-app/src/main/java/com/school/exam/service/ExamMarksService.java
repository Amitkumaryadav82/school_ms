package com.school.exam.service;

import com.school.exam.dto.MarksEntryDTO;
import com.school.exam.dto.ChapterWisePerformanceDTO;
import com.school.exam.dto.TabulationSheetDTO;

import java.util.List;

/**
 * Service interface for managing exam marks entry and reports
 */
public interface ExamMarksService {
    
    /**
     * Submit marks for a student in a specific exam and subject
     * @param marksEntryDTO the marks data
     * @return the saved marks data
     */
    MarksEntryDTO submitMarks(MarksEntryDTO marksEntryDTO);
    
    /**
     * Get marks for a student in a specific exam and subject
     * @param studentId the student id
     * @param examId the exam id
     * @param subjectId the subject id
     * @return the marks data
     */
    MarksEntryDTO getStudentMarks(Long studentId, Long examId, Long subjectId);
    
    /**
     * Get marks for all students in a specific exam and subject
     * @param examId the exam id
     * @param subjectId the subject id
     * @return list of student marks
     */
    List<MarksEntryDTO> getAllStudentMarks(Long examId, Long subjectId);
    
    /**
     * Lock marks for students to prevent further edits
     * @param lockRequest the lock request data
     * @return true if successful
     */
    boolean lockMarks(MarksEntryDTO.BulkMarksLockRequest lockRequest);
    
    /**
     * Edit marks after locking (requires permission)
     * @param editRequest the edit request data
     * @param editorId the user making the edit
     * @return the updated marks
     */
    MarksEntryDTO editLockedMarks(MarksEntryDTO.MarksEditRequest editRequest, Long editorId);
    
    /**
     * Generate chapter-wise performance analysis for a student
     * @param studentId the student id
     * @param examId the exam id
     * @param subjectId the subject id
     * @return chapter-wise performance data
     */
    ChapterWisePerformanceDTO getChapterWisePerformance(Long studentId, Long examId, Long subjectId);
    
    /**
     * Generate tabulation sheet for a class's exam results
     * @param examId the exam id
     * @param grade the class/grade
     * @param section the section
     * @return tabulation sheet data
     */
    TabulationSheetDTO generateTabulationSheet(Long examId, Integer grade, String section);
    
    /**
     * Export tabulation sheet to Excel format
     * @param examId the exam id
     * @param grade the class/grade
     * @param section the section
     * @return byte array of the Excel file
     */
    byte[] exportTabulationSheetToExcel(Long examId, Integer grade, String section);
    
    /**
     * Generate report card PDF for a student
     * @param studentId the student id
     * @param examId the exam id
     * @return byte array of the PDF file
     */
    byte[] generateStudentReportCard(Long studentId, Long examId);
}
