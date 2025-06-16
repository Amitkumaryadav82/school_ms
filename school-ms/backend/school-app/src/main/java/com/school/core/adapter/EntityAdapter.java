package com.school.core.adapter;

import org.springframework.stereotype.Component;
import com.school.core.model.Staff;
import com.school.core.model.TeacherDetails;
import com.school.core.model.legacy.LegacyStaff;
import com.school.core.model.legacy.LegacyTeacherDetails;
import com.school.hrm.entity.StaffRole;
import com.school.hrm.model.EmploymentStatus;
import com.school.common.util.DateConverter;
import java.time.LocalDateTime;
import java.time.LocalDate;

/**
 * Adapter class to convert between different Staff and TeacherDetails entity types.
 * This class helps with the migration from legacy entities to the consolidated core entities.
 */
@Component
public class EntityAdapter {

    /**
     * Convert from legacy staff model to core model
     *
     * @param legacyStaff Staff from com.school.staff.model.Staff
     * @return Consolidated Staff entity
     */
    public Staff convertStaffModelToCore(com.school.staff.model.Staff legacyStaff) {
        if (legacyStaff == null) return null;

        Staff staff = new Staff();
        staff.setId(legacyStaff.getId());
        staff.setStaffId(legacyStaff.getStaffId());
        staff.setFirstName(legacyStaff.getFirstName());
        staff.setMiddleName(legacyStaff.getMiddleName());
        staff.setLastName(legacyStaff.getLastName());
        staff.setEmail(legacyStaff.getEmail());
        staff.setPhone(legacyStaff.getPhone());
        
        // No conversion needed as both use LocalDate
        staff.setDateOfBirth(legacyStaff.getDateOfBirth());
        staff.setAddress(legacyStaff.getAddress());
        staff.setActive(legacyStaff.isActive());
        
        // Convert teacher details if present
        if (legacyStaff.getTeacherDetails() != null) {
            staff.setTeacherDetails(convertTeacherDetailsModelToCore(legacyStaff.getTeacherDetails()));
        }
        
        return staff;
    }
    
    /**
     * Convert from HRM entity to core model
     *
     * @param hrmStaff Staff from com.school.hrm.entity.Staff
     * @return Consolidated Staff entity
     */
    public Staff convertHrmEntityToCore(com.school.hrm.entity.Staff hrmStaff) {
        if (hrmStaff == null) return null;

        Staff staff = new Staff();
        staff.setId(hrmStaff.getId());
        staff.setStaffId(hrmStaff.getStaffId());
        staff.setFirstName(hrmStaff.getFirstName());
        staff.setLastName(hrmStaff.getLastName());        staff.setEmail(hrmStaff.getEmail());
        // Check if phone method exists in hrm staff
        if (hrmStaff.getPhoneNumber() != null) {
            staff.setPhone(hrmStaff.getPhoneNumber());
        }
        staff.setDateOfBirth(hrmStaff.getDateOfBirth());
        staff.setAddress(hrmStaff.getAddress());        // Convert StaffRole to string if necessary
        if (hrmStaff.getRole() != null) {
            staff.setRole(hrmStaff.getRole().getRoleName());
        }
        staff.setEmploymentStatus(hrmStaff.getEmploymentStatus());
        staff.setActive(hrmStaff.getIsActive());
        // Check if the method exists or use joinDate
        if (hrmStaff.getJoinDate() != null) {
            staff.setJoinDate(hrmStaff.getJoinDate());
            staff.setJoiningDate(hrmStaff.getJoinDate());
        }
        
        return staff;
    }
      /**
     * Convert from legacy staff model to core model
     *
     * @param legacyStaff Staff from legacy model
     * @return Consolidated Staff entity
     */
    public Staff convertLegacyStaffToCore(LegacyStaff legacyStaff) {
        if (legacyStaff == null) return null;
        
        Staff staff = new Staff();
        staff.setId(legacyStaff.getId());
        staff.setStaffId(legacyStaff.getStaffId());
        staff.setFirstName(legacyStaff.getFirstName());
        staff.setMiddleName(legacyStaff.getMiddleName());
        staff.setLastName(legacyStaff.getLastName());
        staff.setEmail(legacyStaff.getEmail());
        staff.setPhone(legacyStaff.getPhone());
        
        // Handle null dates with null check
        if (legacyStaff.getDateOfBirth() != null) {
            staff.setDateOfBirth(DateConverter.toLocalDate(legacyStaff.getDateOfBirth()));
        }
        
        staff.setAddress(legacyStaff.getAddress());
        
        // Convert teacher details if present
        if (legacyStaff.getTeacherDetails() != null) {
            TeacherDetails teacherDetails = convertLegacyTeacherDetailsToCore(legacyStaff.getTeacherDetails());
            staff.setTeacherDetails(teacherDetails);
        }
        
        return staff;
    }
    
    /**
     * Convert from legacy TeacherDetails to core TeacherDetails
     *
     * @param legacyTeacherDetails TeacherDetails from com.school.staff.model
     * @return Consolidated TeacherDetails entity
     */    public TeacherDetails convertTeacherDetailsModelToCore(com.school.staff.model.TeacherDetails legacyTeacherDetails) {
        if (legacyTeacherDetails == null) return null;

        TeacherDetails teacherDetails = new TeacherDetails();
        teacherDetails.setId(legacyTeacherDetails.getId());
        teacherDetails.setDepartment(legacyTeacherDetails.getDepartment());
        teacherDetails.setQualification(legacyTeacherDetails.getQualification());
        teacherDetails.setSpecialization(legacyTeacherDetails.getSpecialization());
        teacherDetails.setSubjects(legacyTeacherDetails.getSubjects());
        teacherDetails.setYearsOfExperience(legacyTeacherDetails.getYearsOfExperience());
        
        // Handle null dates with null check
        if (legacyTeacherDetails.getCreatedAt() != null) {
            teacherDetails.setCreatedAt(legacyTeacherDetails.getCreatedAt());
        }
        
        if (legacyTeacherDetails.getUpdatedAt() != null) {
            teacherDetails.setUpdatedAt(legacyTeacherDetails.getUpdatedAt());
        }
        
        return teacherDetails;
    }
      /**
     * Convert from legacy TeacherDetails to core TeacherDetails
     *
     * @param legacyTeacherDetails TeacherDetails from legacy model
     * @return Consolidated TeacherDetails entity
     */
    public TeacherDetails convertLegacyTeacherDetailsToCore(LegacyTeacherDetails legacyTeacherDetails) {
        if (legacyTeacherDetails == null) return null;

        TeacherDetails teacherDetails = new TeacherDetails();
        teacherDetails.setId(legacyTeacherDetails.getId());
        teacherDetails.setDepartment(legacyTeacherDetails.getDepartment());
        teacherDetails.setQualification(legacyTeacherDetails.getQualification());
        teacherDetails.setSpecialization(legacyTeacherDetails.getSpecialization());
        teacherDetails.setSubjects(legacyTeacherDetails.getSubjects());
        teacherDetails.setYearsOfExperience(legacyTeacherDetails.getYearsOfExperience());
        
        // Handle null dates with null check
        if (legacyTeacherDetails.getCreatedAt() != null) {
            teacherDetails.setCreatedAt(DateConverter.toLocalDateTime(legacyTeacherDetails.getCreatedAt()));
        }
        
        if (legacyTeacherDetails.getUpdatedAt() != null) {
            teacherDetails.setUpdatedAt(DateConverter.toLocalDateTime(legacyTeacherDetails.getUpdatedAt()));
        }
        
        return teacherDetails;
    }
}
