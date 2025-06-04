package com.school.exam.controller;

import com.school.exam.dto.DetailedExamSummary;
import com.school.exam.service.ExamAnalysisService;
import com.school.exam.service.ExamReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/exam-analysis")
@Tag(name = "Exam Analysis and Reports", description = "APIs for analyzing exam performance and generating reports")
@SecurityRequirement(name = "bearerAuth")
public class ExamAnalysisController {

        @Autowired
        private ExamAnalysisService examAnalysisService;

        @Autowired
        private ExamReportService examReportService;

        @Operation(summary = "Get detailed exam summary", description = "Generates a detailed exam summary with performance analytics")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Summary generated successfully"),
                        @ApiResponse(responseCode = "404", description = "Exam not found")
        })
        @GetMapping("/{examId}/summary")
        @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
        public ResponseEntity<DetailedExamSummary> getDetailedExamSummary(@PathVariable Long examId) {
                return ResponseEntity.ok(examAnalysisService.generateDetailedExamSummary(examId));
        }

        @Operation(summary = "Generate tabulation sheet", description = "Generates an Excel tabulation sheet for an exam")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Tabulation sheet generated successfully"),
                        @ApiResponse(responseCode = "404", description = "Exam not found")
        })
        @GetMapping("/{examId}/tabulation-sheet")
        @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL')")
        public ResponseEntity<Resource> generateTabulationSheet(@PathVariable Long examId) throws IOException {
                byte[] excelBytes = examReportService.generateTabulationSheet(examId);
                ByteArrayResource resource = new ByteArrayResource(excelBytes);

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tabulation-sheet.xlsx")
                                .contentType(MediaType.parseMediaType(
                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .contentLength(excelBytes.length)
                                .body(resource);
        }

        @Operation(summary = "Generate student report card", description = "Generates a report card for a student for an exam")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Report card generated successfully"),
                        @ApiResponse(responseCode = "404", description = "Exam or student not found")
        })
        @GetMapping("/{examId}/student/{studentId}/report-card")
        @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HOD', 'PRINCIPAL', 'STUDENT', 'PARENT')")
        public ResponseEntity<Resource> generateStudentReportCard(
                        @PathVariable Long examId,
                        @PathVariable Long studentId) throws IOException {
                byte[] excelBytes = examReportService.generateStudentReportCard(examId, studentId);
                ByteArrayResource resource = new ByteArrayResource(excelBytes);

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=student-report-card.xlsx")
                                .contentType(MediaType.parseMediaType(
                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .contentLength(excelBytes.length)
                                .body(resource);
        }
}
