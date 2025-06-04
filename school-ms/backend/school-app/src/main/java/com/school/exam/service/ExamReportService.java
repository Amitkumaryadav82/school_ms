package com.school.exam.service;

import com.school.exam.model.Exam;
import com.school.exam.model.ExamResult;
import com.school.exam.model.DetailedExamResult;
import com.school.exam.repository.ExamRepository;
import com.school.exam.repository.ExamResultRepository;
import com.school.exam.repository.DetailedExamResultRepository;
import com.school.student.service.StudentService;
import com.school.attendance.service.AttendanceService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@Transactional
public class ExamReportService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

    @Autowired
    private DetailedExamResultRepository detailedResultRepository;

    @Autowired
    private ExamService examService;

    @Autowired
    private ExamAnalysisService examAnalysisService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private AttendanceService attendanceService;

    /**
     * Generates a tabulation sheet for an exam in Excel format
     */
    public byte[] generateTabulationSheet(Long examId) throws IOException {
        Exam exam = examService.getExam(examId);
        List<ExamResult> results = examResultRepository.findByExamId(examId);

        // Sort results by roll number or name
        results.sort(Comparator.comparing(r -> r.getStudent().getRollNumber()));

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Tabulation Sheet");

            // Create header row
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = createHeaderStyle(workbook);

            String[] headers = {
                    "Sl. No.", "Roll No.", "Student Name", "Marks Obtained", "Total Marks",
                    "Percentage", "Status", "Rank", "Remarks"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 4000);
            }

            // Populate data rows
            int rowNum = 1;
            int rank = 1;
            double prevMarks = -1;
            int prevRank = 0;

            // Sort by marks in descending order for ranking
            List<ExamResult> sortedResults = new ArrayList<>(results);
            sortedResults.sort(Comparator.comparing(ExamResult::getMarksObtained).reversed());

            // Create a map to store ranks
            Map<Long, Integer> studentRanks = new HashMap<>();
            for (int i = 0; i < sortedResults.size(); i++) {
                ExamResult result = sortedResults.get(i);

                if (i > 0 && Math.abs(result.getMarksObtained() - prevMarks) < 0.001) {
                    studentRanks.put(result.getStudent().getId(), prevRank);
                } else {
                    studentRanks.put(result.getStudent().getId(), rank);
                    prevRank = rank;
                }

                prevMarks = result.getMarksObtained();
                rank++;
            }

            // Create data rows in original order
            for (ExamResult result : results) {
                Row row = sheet.createRow(rowNum++);

                row.createCell(0).setCellValue(rowNum - 1); // Sl. No.
                row.createCell(1).setCellValue(result.getStudent().getRollNumber());
                row.createCell(2)
                        .setCellValue(result.getStudent().getFirstName() + " " + result.getStudent().getLastName());
                row.createCell(3).setCellValue(result.getMarksObtained());
                row.createCell(4).setCellValue(exam.getTotalMarks());

                double percentage = (exam.getTotalMarks() > 0)
                        ? (result.getMarksObtained() / exam.getTotalMarks()) * 100
                        : 0;
                row.createCell(5).setCellValue(String.format("%.2f%%", percentage));

                row.createCell(6).setCellValue(result.getStatus().toString());
                row.createCell(7).setCellValue(studentRanks.get(result.getStudent().getId()));
                row.createCell(8).setCellValue(result.getRemarks() != null ? result.getRemarks() : "");
            }

            // Add summary statistics at the bottom
            int summaryStartRow = rowNum + 1;
            Row passingRow = sheet.createRow(summaryStartRow);
            passingRow.createCell(0).setCellValue("Passing Marks:");
            passingRow.createCell(1).setCellValue(exam.getPassingMarks());

            Row totalStudentsRow = sheet.createRow(summaryStartRow + 1);
            totalStudentsRow.createCell(0).setCellValue("Total Students:");
            totalStudentsRow.createCell(1).setCellValue(results.size());

            long passCount = results.stream()
                    .filter(r -> r.getStatus() == ExamResult.ResultStatus.PASS)
                    .count();

            Row passCountRow = sheet.createRow(summaryStartRow + 2);
            passCountRow.createCell(0).setCellValue("Students Passed:");
            passCountRow.createCell(1).setCellValue(passCount);

            Row failCountRow = sheet.createRow(summaryStartRow + 3);
            failCountRow.createCell(0).setCellValue("Students Failed:");
            failCountRow.createCell(1).setCellValue(results.size() - passCount);

            Row passPercentRow = sheet.createRow(summaryStartRow + 4);
            passPercentRow.createCell(0).setCellValue("Pass Percentage:");
            double passPercentage = (results.size() > 0) ? ((double) passCount / results.size()) * 100 : 0;
            passPercentRow.createCell(1).setCellValue(String.format("%.2f%%", passPercentage));

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Generates a detailed report card for a student including attendance data
     */
    public byte[] generateStudentReportCard(Long examId, Long studentId) throws IOException {
        Exam exam = examService.getExam(examId);
        ExamResult result = examResultRepository.findByExamIdAndStudentId(examId, studentId)
                .orElseThrow(() -> new RuntimeException("Exam result not found for student"));

        List<DetailedExamResult> detailedResults = detailedResultRepository.findByExamResultId(result.getId());

        // Get attendance data for the student
        LocalDate semesterStartDate = LocalDate.of(LocalDate.now().getYear(),
                LocalDate.now().getMonth().getValue() <= 6 ? 1 : 7, 1);
        LocalDate currentDate = LocalDate.now();

        double attendancePercentage = attendanceService.getStudentAttendancePercentage(
                studentId, semesterStartDate, currentDate);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Report Card");

            // Create title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("STUDENT REPORT CARD");

            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

            // Student and exam details
            Row examDetailsRow = sheet.createRow(2);
            examDetailsRow.createCell(0).setCellValue("Exam:");
            examDetailsRow.createCell(1).setCellValue(exam.getName());
            examDetailsRow.createCell(3).setCellValue("Date:");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            examDetailsRow.createCell(4).setCellValue(exam.getExamDate().format(formatter));

            Row studentDetailsRow = sheet.createRow(3);
            studentDetailsRow.createCell(0).setCellValue("Student Name:");
            studentDetailsRow.createCell(1).setCellValue(
                    result.getStudent().getFirstName() + " " + result.getStudent().getLastName());
            studentDetailsRow.createCell(3).setCellValue("Roll No:");
            studentDetailsRow.createCell(4).setCellValue(result.getStudent().getRollNumber());

            Row gradeDetailsRow = sheet.createRow(4);
            gradeDetailsRow.createCell(0).setCellValue("Grade/Class:");
            gradeDetailsRow.createCell(1).setCellValue(String.valueOf(exam.getGrade()));
            gradeDetailsRow.createCell(3).setCellValue("Subject:");
            gradeDetailsRow.createCell(4).setCellValue(exam.getSubject());

            // Create marks table header
            Row marksHeaderRow = sheet.createRow(6);
            CellStyle headerStyle = createHeaderStyle(workbook);

            String[] headers = {
                    "Section/Question", "Max Marks", "Marks Obtained", "Remarks"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = marksHeaderRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 4000);
            }

            // Populate detailed marks
            int rowNum = 7;

            // Sort by section and question number
            detailedResults.sort(Comparator
                    .comparing((DetailedExamResult r) -> r.getQuestion().getSectionNumber())
                    .thenComparing(r -> r.getQuestion().getQuestionNumber()));

            for (DetailedExamResult detailedResult : detailedResults) {
                Row row = sheet.createRow(rowNum++);

                String questionLabel = "Q" + detailedResult.getQuestion().getSectionNumber()
                        + "." + detailedResult.getQuestion().getQuestionNumber();

                row.createCell(0).setCellValue(questionLabel);
                row.createCell(1).setCellValue(detailedResult.getQuestion().getMarks());
                row.createCell(2).setCellValue(detailedResult.getMarksObtained());
                row.createCell(3).setCellValue(
                        detailedResult.getTeacherRemarks() != null ? detailedResult.getTeacherRemarks() : "");
            }

            // Add total row
            Row totalRow = sheet.createRow(rowNum++);
            CellStyle totalStyle = workbook.createCellStyle();
            Font totalFont = workbook.createFont();
            totalFont.setBold(true);
            totalStyle.setFont(totalFont);

            Cell totalLabelCell = totalRow.createCell(0);
            totalLabelCell.setCellValue("TOTAL");
            totalLabelCell.setCellStyle(totalStyle);

            Cell totalMaxCell = totalRow.createCell(1);
            totalMaxCell.setCellValue(exam.getTotalMarks());
            totalMaxCell.setCellStyle(totalStyle);

            Cell totalObtainedCell = totalRow.createCell(2);
            totalObtainedCell.setCellValue(result.getMarksObtained());
            totalObtainedCell.setCellStyle(totalStyle);

            // Add percentage and status
            rowNum += 2;
            Row percentageRow = sheet.createRow(rowNum++);
            percentageRow.createCell(0).setCellValue("Percentage:");
            double percentage = (exam.getTotalMarks() > 0) ? (result.getMarksObtained() / exam.getTotalMarks()) * 100
                    : 0;
            percentageRow.createCell(1).setCellValue(String.format("%.2f%%", percentage));

            Row statusRow = sheet.createRow(rowNum++);
            statusRow.createCell(0).setCellValue("Status:");
            statusRow.createCell(1).setCellValue(result.getStatus().toString());

            // Add attendance information
            rowNum += 2;
            Row attendanceRow = sheet.createRow(rowNum++);
            CellStyle attendanceStyle = workbook.createCellStyle();
            Font attendanceFont = workbook.createFont();
            attendanceFont.setBold(true);
            attendanceStyle.setFont(attendanceFont);

            Cell attendanceHeaderCell = attendanceRow.createCell(0);
            attendanceHeaderCell.setCellValue("ATTENDANCE");
            attendanceHeaderCell.setCellStyle(attendanceStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 3));

            Row attendanceDetailsRow = sheet.createRow(rowNum++);
            attendanceDetailsRow.createCell(0).setCellValue("Attendance Percentage:");
            attendanceDetailsRow.createCell(1).setCellValue(String.format("%.2f%%", attendancePercentage));

            // Add remarks
            rowNum += 2;
            Row remarksHeaderRow = sheet.createRow(rowNum++);
            Cell remarksHeaderCell = remarksHeaderRow.createCell(0);
            remarksHeaderCell.setCellValue("REMARKS");
            remarksHeaderCell.setCellStyle(attendanceStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 3));

            Row remarksRow = sheet.createRow(rowNum++);
            remarksRow.createCell(0).setCellValue(result.getRemarks() != null ? result.getRemarks() : "");
            sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 3));

            // Add signature fields
            rowNum += 3;
            Row signatureRow = sheet.createRow(rowNum++);
            signatureRow.createCell(0).setCellValue("Teacher's Signature");
            signatureRow.createCell(2).setCellValue("Principal's Signature");
            sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 1));
            sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 2, 3));

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Creates a header cell style with bold font and borders
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        return headerStyle;
    }
}
