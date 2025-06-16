package com.school.common.util;

import com.school.core.model.Staff;
import com.school.core.model.TeacherDetails;
import com.school.core.model.legacy.LegacyStaff;
import com.school.core.model.legacy.LegacyTeacherDetails;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

/**
 * Parser for CSV and Excel files.
 * Uses standardized qualifier naming convention.
 * This is a consolidated version migrated from com.example.schoolms.util.CsvXlsParser
 */
@Component("schoolCommonCsvXlsParser")
public class CsvXlsParser {

    private static final Logger logger = LoggerFactory.getLogger(CsvXlsParser.class);

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Parse staff data from a CSV or Excel file
     * 
     * @param file The uploaded file
     * @return List of Staff objects
     * @throws IOException If there is an error reading the file
     */
    public List<Staff> parseStaffFromFile(MultipartFile file) throws IOException {
        List<Staff> staffList = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            // Skip header line
            String line = reader.readLine();
            if (line == null) {
                throw new IOException("File is empty");
            }

            // Process data rows
            while ((line = reader.readLine()) != null) {
                if (StringUtils.isBlank(line)) {
                    continue;
                }

                String[] fields = line.split(",");
                if (fields.length < 5) {
                    logger.warn("Skipping line with insufficient data: {}", line);
                    continue;
                }

                // Create staff object from CSV fields
                Staff staff = createStaffFromFields(fields);
                staffList.add(staff);
            }
        }

        return staffList;
    }
      /**
     * Legacy method to support older code that expects legacy Staff model
     */
    public List<LegacyStaff> parseLegacyStaffFromFile(MultipartFile file) throws IOException {
        List<Staff> coreStaffList = parseStaffFromFile(file);
        List<LegacyStaff> legacyStaffList = new ArrayList<>();
        
        for (Staff coreStaff : coreStaffList) {
            LegacyStaff legacyStaff = convertToLegacyStaff(coreStaff);
            legacyStaffList.add(legacyStaff);
        }
          return legacyStaffList;
    }

    /**
     * Create a Staff object from CSV fields
     * 
     * @param fields The CSV field array
     * @return A Staff object
     */
    private Staff createStaffFromFields(String[] fields) {
        Staff staff = new Staff();
        
        // Parse basic fields
        staff.setStaffId(fields[0]);
        staff.setFirstName(fields[1]);
        
        if (fields.length > 2) {
            staff.setLastName(fields[2]);
        }
        
        if (fields.length > 3) {
            staff.setEmail(fields[3]);
        }
        
        if (fields.length > 4) {
            staff.setPhone(fields[4]);
        }
        
        if (fields.length > 5) {
            try {
                LocalDate dob = LocalDate.parse(fields[5], DATE_FORMAT);
                staff.setDateOfBirth(dob);
            } catch (DateTimeParseException e) {
                logger.warn("Invalid date format for DOB: {}", fields[5]);
            }
        }
        
        if (fields.length > 6) {
            staff.setAddress(fields[6]);
        }
        
        // Set default values
        staff.setActive(true);
        
        // If teacher details are included in the CSV (position 7-9)
        if (fields.length > 7 && !StringUtils.isBlank(fields[7])) {
            TeacherDetails teacherDetails = new TeacherDetails();
            teacherDetails.setDepartment(fields[7]);
            
            if (fields.length > 8) {
                teacherDetails.setSubjects(fields[8]);
            }
            
            if (fields.length > 9 && !StringUtils.isBlank(fields[9])) {
                try {
                    teacherDetails.setYearsOfExperience(Integer.parseInt(fields[9]));
                } catch (NumberFormatException e) {
                    logger.warn("Invalid years of experience: {}", fields[9]);
                }
            }
            
            staff.setTeacherDetails(teacherDetails);
        }
        
        return staff;
    }
      /**
     * Convert a core Staff object to a legacy Staff object
     * To be used during migration only
     * 
     * @param coreStaff The core Staff object
     * @return A legacy Staff object
     */
    private LegacyStaff convertToLegacyStaff(Staff coreStaff) {
        LegacyStaff legacyStaff = new LegacyStaff();
        
        legacyStaff.setStaffId(coreStaff.getStaffId());
        legacyStaff.setFirstName(coreStaff.getFirstName());
        legacyStaff.setMiddleName(coreStaff.getMiddleName());
        legacyStaff.setLastName(coreStaff.getLastName());
        legacyStaff.setEmail(coreStaff.getEmail());
        legacyStaff.setPhone(coreStaff.getPhone());
        
        // Convert LocalDate to Date
        if (coreStaff.getDateOfBirth() != null) {
            legacyStaff.setDateOfBirth(DateConverter.toDate(coreStaff.getDateOfBirth()));
        }
        
        legacyStaff.setAddress(coreStaff.getAddress());
        
        // Handle joining date
        if (coreStaff.getJoiningDate() != null) {
            legacyStaff.setJoiningDate(DateConverter.toDate(coreStaff.getJoiningDate()));
        } else if (coreStaff.getJoinDate() != null) {
            legacyStaff.setJoiningDate(DateConverter.toDate(coreStaff.getJoinDate()));
        }
        
        // Handle teacher details if present
        if (coreStaff.getTeacherDetails() != null) {
            LegacyTeacherDetails legacyTeacherDetails = new LegacyTeacherDetails();
            
            TeacherDetails coreTeacherDetails = coreStaff.getTeacherDetails();
            legacyTeacherDetails.setDepartment(coreTeacherDetails.getDepartment());
            legacyTeacherDetails.setSubjects(coreTeacherDetails.getSubjects());
            legacyTeacherDetails.setYearsOfExperience(coreTeacherDetails.getYearsOfExperience());
            legacyTeacherDetails.setSpecialization(coreTeacherDetails.getSpecialization());
            
            // Convert dates
            if (coreTeacherDetails.getCreatedAt() != null) {
                legacyTeacherDetails.setCreatedAt(DateConverter.toDate(coreTeacherDetails.getCreatedAt()));
            }
            
            if (coreTeacherDetails.getUpdatedAt() != null) {
                legacyTeacherDetails.setUpdatedAt(DateConverter.toDate(coreTeacherDetails.getUpdatedAt()));
            }
            
            legacyStaff.setTeacherDetails(legacyTeacherDetails);
        }
        
        return legacyStaff;
    }
}
