package com.school.core.adapter;

import org.springframework.stereotype.Component;
import com.school.core.model.Staff;
import com.school.core.model.TeacherDetails;
import com.school.core.model.legacy.LegacyStaff;
import com.school.core.model.legacy.LegacyTeacherDetails;
import com.school.core.model.StaffRole;
import com.school.core.model.EmploymentStatus;
import com.school.common.util.DateConverter;
import java.time.LocalDateTime;
import java.time.LocalDate;

/**
 * Adapter class to convert between different Staff and TeacherDetails entity types.
 */
@Component
public class EntityAdapter {
    
    /**
     * Convert from legacy entity to core model
     *
     * @param legacyStaff Staff from com.example.schoolms.model.Staff (LegacyStaff)
     * @return Consolidated Staff entity
     */
    public Staff convertLegacyToCore(LegacyStaff legacyStaff) {
        if (legacyStaff == null) return null;
        
        Staff staff = new Staff();
        
        staff.setStaffId(legacyStaff.getStaffId());
        staff.setFirstName(legacyStaff.getFirstName());
        staff.setLastName(legacyStaff.getLastName());
        staff.setEmail(legacyStaff.getEmail());
        staff.setPhone(legacyStaff.getPhone());
        
        // Convert dates
        staff.setDateOfJoining(DateConverter.convertToLocalDate(legacyStaff.getJoiningDate()));
        staff.setDateOfBirth(DateConverter.convertToLocalDate(legacyStaff.getDateOfBirth()));
        
        // Set other fields from legacy model
        staff.setAddress(legacyStaff.getAddress());
        staff.setGender(legacyStaff.getGender());
        
        return staff;
    }
    
    /**
     * Convert from legacy TeacherDetails to core TeacherDetails
     *
     * @param legacyDetails TeacherDetails from com.example.schoolms.model.TeacherDetails
     * @return Consolidated TeacherDetails entity
     */    public TeacherDetails convertLegacyToCore(LegacyTeacherDetails legacyDetails) {
        if (legacyDetails == null) return null;
        
        TeacherDetails details = new TeacherDetails();
        
        // Set fields from legacy model
        details.setSubjectsTaught(legacyDetails.getSubjectsTaught());
        details.setQualification(legacyDetails.getQualification());
        details.setYearsOfExperience(legacyDetails.getYearsOfExperience());
        details.setSpecialization(legacyDetails.getSpecialization());
        
        return details;
    }
    
    /**
     * Convert from Staff Module model to Core model
     * 
     * @param staffModuleStaff Staff from com.school.staff.model.Staff
     * @return Consolidated Staff entity
     */
    public Staff convertStaffModelToCore(com.school.staff.model.Staff staffModuleStaff) {
        if (staffModuleStaff == null) return null;
        
        Staff staff = new Staff();
        
        // Core fields
        staff.setStaffId(staffModuleStaff.getStaffId());
        staff.setFirstName(staffModuleStaff.getFirstName());
        staff.setLastName(staffModuleStaff.getLastName());
        staff.setEmail(staffModuleStaff.getEmail());
        staff.setPhone(staffModuleStaff.getPhone());
        
        // Additional fields if available
        if (staffModuleStaff.getAddress() != null) {
            staff.setAddress(staffModuleStaff.getAddress());
        }
        
        if (staffModuleStaff.getDepartment() != null) {
            staff.setDepartment(staffModuleStaff.getDepartment());
        }
        
        return staff;
    }
}
