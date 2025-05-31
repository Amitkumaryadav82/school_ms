package com.school.hrm.util;

import com.school.hrm.dto.BulkAttendanceRequestDTO;
import com.school.hrm.model.AttendanceStatus;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class CSVHelper {

    private static final String CSV_TYPE = "text/csv";
    private static final String[] CSV_HEADERS = { "Employee ID", "Name", "Department", "Status", "Reason" };

    /**
     * Check if the file is a CSV file
     */
    public static boolean isCSVFile(MultipartFile file) {
        return CSV_TYPE.equals(file.getContentType());
    }

    /**
     * Parse attendance data from CSV file
     */
    public static Map<String, Object> parseAttendanceCSV(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        List<BulkAttendanceRequestDTO.SingleAttendanceDTO> attendanceRecords = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream()));
                CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            // Get date from the first line comment (expected format: # Date: YYYY-MM-DD)
            String firstLine = fileReader.readLine();
            LocalDate attendanceDate = null;

            if (firstLine.startsWith("# Date:")) {
                String dateStr = firstLine.substring(7).trim();
                try {
                    attendanceDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE);
                } catch (Exception e) {
                    errors.add("Invalid date format in the file header. Expected: YYYY-MM-DD");
                }
            } else {
                errors.add("Missing date in the file header. Expected format: # Date: YYYY-MM-DD");
            }

            // Parse records
            for (CSVRecord csvRecord : csvParser) {
                try {
                    Long employeeId = Long.parseLong(csvRecord.get("Employee ID"));
                    String statusStr = csvRecord.get("Status").toUpperCase();
                    String reason = csvRecord.get("Reason");

                    // Validate status
                    try {
                        AttendanceStatus.valueOf(statusStr);
                    } catch (IllegalArgumentException e) {
                        throw new IllegalArgumentException("Invalid status: " + statusStr);
                    }

                    // Create attendance record
                    BulkAttendanceRequestDTO.SingleAttendanceDTO record = new BulkAttendanceRequestDTO.SingleAttendanceDTO();
                    record.setEmployeeId(employeeId);
                    record.setStatus(statusStr);
                    record.setReason(reason);

                    attendanceRecords.add(record);

                } catch (Exception e) {
                    errors.add("Error in row " + csvRecord.getRecordNumber() + ": " + e.getMessage());
                }
            }

            // Create bulk request
            BulkAttendanceRequestDTO bulkRequest = new BulkAttendanceRequestDTO();
            bulkRequest.setDate(attendanceDate);
            bulkRequest.setAttendanceRecords(attendanceRecords);

            result.put("bulkRequest", bulkRequest);
            result.put("errors", errors);
            result.put("success", errors.isEmpty());

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "Failed to parse CSV file: " + e.getMessage());
        }

        return result;
    }

    /**
     * Generate a CSV template for attendance upload
     */
    public static ByteArrayInputStream generateAttendanceTemplate(List<Map<String, Object>> teacherData) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
                CSVPrinter csvPrinter = new CSVPrinter(new OutputStreamWriter(out), CSVFormat.DEFAULT
                        .withHeader(CSV_HEADERS))) {

            // Add a comment with today's date
            csvPrinter.printComment("Date: " + LocalDate.now().format(DateTimeFormatter.ISO_DATE));

            // Add rows for each teacher
            for (Map<String, Object> teacher : teacherData) {
                csvPrinter.printRecord(
                        teacher.get("id"),
                        teacher.get("name"),
                        teacher.get("department"),
                        "PRESENT", // Default status
                        "" // Empty reason
                );
            }

            csvPrinter.flush();
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate CSV template: " + e.getMessage());
        }
    }
}
