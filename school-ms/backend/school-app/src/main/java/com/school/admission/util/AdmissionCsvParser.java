package com.school.admission.util;

import com.school.admission.dto.AdmissionRequest;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Parser for CSV files containing admission application data
 */
@Component
public class AdmissionCsvParser {

    private static final Logger logger = LoggerFactory.getLogger(AdmissionCsvParser.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    // CSV template column headers
    private static final String[] TEMPLATE_HEADERS = {
        "Applicant Name", "Date of Birth (yyyy-MM-dd)", "Email", "Contact Number",
        "Guardian Name", "Guardian Contact", "Guardian Email", "Address",
        "Grade Applying", "Previous School", "Previous Grade", "Previous Percentage",
        "Blood Group", "Medical Conditions"
    };

    /**
     * Parse admission data from a CSV file
     * 
     * @param file The uploaded CSV file
     * @return List of AdmissionRequest objects
     * @throws IOException If there is an error reading the file
     */
    public List<AdmissionRequest> parseAdmissionsFromFile(MultipartFile file) throws IOException {
        List<AdmissionRequest> admissionsList = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int lineNumber = 1; // Start with line 1 for error reporting (headers = line 1)

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            // Read and validate header line
            String headerLine = reader.readLine();
            lineNumber++;
            
            if (headerLine == null) {
                throw new IOException("File is empty");
            }
            
            String[] headers = headerLine.split(",");
            validateHeaders(headers, errors);
            
            if (!errors.isEmpty()) {
                throw new IOException("Invalid CSV format: " + String.join("; ", errors));
            }

            // Process data rows
            String line;
            while ((line = reader.readLine()) != null) {
                if (StringUtils.isBlank(line)) {
                    lineNumber++;
                    continue;
                }

                try {
                    String[] fields = line.split(",");
                    if (fields.length < headers.length) {
                        logger.warn("Line {}: Insufficient data, expected {} fields but got {}", 
                            lineNumber, headers.length, fields.length);
                        errors.add(String.format("Line %d: Insufficient data", lineNumber));
                        lineNumber++;
                        continue;
                    }

                    // Create admission request object from CSV fields
                    AdmissionRequest admission = createAdmissionRequestFromFields(fields);
                    admissionsList.add(admission);
                } catch (Exception e) {
                    logger.error("Error parsing line {}: {}", lineNumber, e.getMessage());
                    errors.add(String.format("Line %d: %s", lineNumber, e.getMessage()));
                }
                
                lineNumber++;
            }
        }
        
        if (!errors.isEmpty()) {
            throw new IOException("Errors processing CSV: " + String.join("; ", errors));
        }

        return admissionsList;
    }
    
    /**
     * Validates the CSV headers against the expected template
     */
    private void validateHeaders(String[] headers, List<String> errors) {
        for (int i = 0; i < TEMPLATE_HEADERS.length; i++) {
            if (i >= headers.length || !headers[i].trim().equalsIgnoreCase(TEMPLATE_HEADERS[i])) {
                errors.add("Missing or invalid header: expected '" + TEMPLATE_HEADERS[i] + "'");
            }
        }
    }

    /**
     * Create an AdmissionRequest object from CSV fields
     * 
     * @param fields The CSV field array
     * @return An AdmissionRequest object
     */
    private AdmissionRequest createAdmissionRequestFromFields(String[] fields) {
        AdmissionRequest request = new AdmissionRequest();
        
        // Parse basic fields (fields may contain leading/trailing whitespace from CSV)
        request.setApplicantName(fields[0].trim());
        
        try {
            request.setDateOfBirth(LocalDate.parse(fields[1].trim(), DATE_FORMAT));
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format for Date of Birth. Use yyyy-MM-dd");
        }
        
        request.setEmail(fields[2].trim());
        request.setContactNumber(fields[3].trim());
        request.setGuardianName(fields[4].trim());
        request.setGuardianContact(fields[5].trim());
        
        // Optional fields
        if (fields.length > 6 && StringUtils.isNotBlank(fields[6])) {
            request.setGuardianEmail(fields[6].trim());
        }
        
        if (fields.length > 7 && StringUtils.isNotBlank(fields[7])) {
            request.setAddress(fields[7].trim());
        }
        
        if (fields.length > 8 && StringUtils.isNotBlank(fields[8])) {
            try {
                request.setGradeApplying(Integer.parseInt(fields[8].trim()));
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid grade format. Must be a number");
            }
        } else {
            throw new IllegalArgumentException("Grade applying is required");
        }
        
        if (fields.length > 9 && StringUtils.isNotBlank(fields[9])) {
            request.setPreviousSchool(fields[9].trim());
        }
        
        if (fields.length > 10 && StringUtils.isNotBlank(fields[10])) {
            request.setPreviousGrade(fields[10].trim());
        }
        
        if (fields.length > 11) {
            request.setPreviousPercentage(fields[11].trim());
        }
        
        if (fields.length > 12 && StringUtils.isNotBlank(fields[12])) {
            request.setBloodGroup(fields[12].trim());
        }
        
        if (fields.length > 13 && StringUtils.isNotBlank(fields[13])) {
            request.setMedicalConditions(fields[13].trim());
        }
        
        return request;
    }
    
    /**
     * Generate a CSV template for bulk admission upload
     * 
     * @return byte array containing the CSV template
     * @throws IOException if error generating template
     */
    public byte[] generateCsvTemplate() throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Write headers
            String headerLine = String.join(",", TEMPLATE_HEADERS);
            out.write((headerLine + "\n").getBytes());
            
            // Write sample row
            String sampleRow = "John Doe,2010-01-15,john.doe@example.com,1234567890," +
                              "Parent Name,9876543210,parent@example.com,123 Main St," +
                              "5,Previous School,4,85.5,A+,None";
            out.write(sampleRow.getBytes());
            
            return out.toByteArray();
        }
    }
}
