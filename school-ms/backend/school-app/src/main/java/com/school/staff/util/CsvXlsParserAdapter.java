package com.school.staff.util;

import java.io.IOException;
import java.util.List;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.school.staff.model.Staff;
import com.school.common.util.CsvXlsParser;
import com.school.common.util.DateConverter;
import com.school.core.model.legacy.LegacyStaff;
import com.school.core.model.legacy.LegacyTeacherDetails;

/**
 * Adapter class for parsing CSV and Excel files for staff data
 */
@Component
public class CsvXlsParserAdapter {
    
    private final CsvXlsParser csvXlsParser;
    
    /**
     * Autowires the CsvXlsParser with standardized qualifier.
     * 
     * @param csvXlsParser the implementation from com.school.common.util.CsvXlsParser
     */
    @Autowired
    public CsvXlsParserAdapter(@Qualifier("schoolCommonCsvXlsParser") CsvXlsParser csvXlsParser) {
        this.csvXlsParser = csvXlsParser;
    }
    
    /**
     * Parse staff data from a CSV or Excel file
     * 
     * @param file The uploaded file containing staff data
     * @return List of staff objects parsed from the file
     * @throws IOException If there's an error reading the file
     */    public List<LegacyStaff> parseStaffFromFile(MultipartFile file) throws IOException {
        // Get the new model Staff objects
        List<com.school.core.model.Staff> staffList = csvXlsParser.parseStaffFromFile(file);
        
        // Convert to legacy model Staff objects
        List<LegacyStaff> legacyStaffList = new ArrayList<>();        for (com.school.core.model.Staff staff : staffList) {
            LegacyStaff legacyStaff = convertToLegacyStaff(staff);
            legacyStaffList.add(legacyStaff);
        }
        
        return legacyStaffList;
    }
    
    /**
     * Parse legacy staff data from a CSV or Excel file
     * 
     * @param file The uploaded file containing staff data
     * @return List of legacy staff objects parsed from the file
     * @throws IOException If there's an error reading the file
     */
    public List<LegacyStaff> parseLegacyStaffFromFile(MultipartFile file) throws IOException {
        return parseStaffFromFile(file);
    }
    
    /**
     * Converts the new Staff model to the legacy Staff model
     * 
     * @param staff The new model staff object
     * @return A legacy model staff object with copied properties
     */
    private LegacyStaff convertToLegacyStaff(com.school.core.model.Staff staff) {
        LegacyStaff legacyStaff = new LegacyStaff();
        
        legacyStaff.setId(staff.getId());
        legacyStaff.setStaffId(staff.getStaffId());
        legacyStaff.setFirstName(staff.getFirstName());
        legacyStaff.setMiddleName(staff.getMiddleName());
        legacyStaff.setLastName(staff.getLastName());
        legacyStaff.setEmail(staff.getEmail());
        legacyStaff.setPhone(staff.getPhone());
        legacyStaff.setPhoneNumber(staff.getPhoneNumber());
        legacyStaff.setAddress(staff.getAddress());        legacyStaff.setRole(staff.getRole());
        
        // Convert LocalDate to Date
        if (staff.getDateOfBirth() != null) {
            legacyStaff.setDateOfBirth(DateConverter.toDate(staff.getDateOfBirth()));
        }
        
        if (staff.getJoiningDate() != null) {
            legacyStaff.setJoiningDate(DateConverter.toDate(staff.getJoiningDate()));
        }
        
        legacyStaff.setDepartment(staff.getDepartment());
        legacyStaff.setActive(staff.isActive());
        
        // Handle TeacherDetails if present
        if (staff.getTeacherDetails() != null) {
            com.school.core.model.TeacherDetails teacherDetails = staff.getTeacherDetails();
            LegacyTeacherDetails legacyTeacherDetails = new LegacyTeacherDetails();
            
            // Copy TeacherDetails properties
            legacyTeacherDetails.setId(teacherDetails.getId());
            legacyTeacherDetails.setDepartment(teacherDetails.getDepartment());
            legacyTeacherDetails.setQualification(teacherDetails.getQualification());
            legacyTeacherDetails.setSpecialization(teacherDetails.getSpecialization());
            legacyTeacherDetails.setSubjects(teacherDetails.getSubjects());
            legacyTeacherDetails.setYearsOfExperience(teacherDetails.getYearsOfExperience());
            
            // Convert LocalDateTime to Date
            if (teacherDetails.getCreatedAt() != null) {
                legacyTeacherDetails.setCreatedAt(DateConverter.toDate(teacherDetails.getCreatedAt()));
            }
            if (teacherDetails.getUpdatedAt() != null) {
                legacyTeacherDetails.setUpdatedAt(DateConverter.toDate(teacherDetails.getUpdatedAt()));
            }
            
            legacyStaff.setTeacherDetails(legacyTeacherDetails);
        }
        
        return legacyStaff;
    }
}