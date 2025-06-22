package com.school.core.adapter;

import org.springframework.beans.factory.annotation.Autowired;
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
        staff.setMiddleName(staffModuleStaff.getMiddleName());
        staff.setLastName(staffModuleStaff.getLastName());
        staff.setEmail(staffModuleStaff.getEmail());
        staff.setPhone(staffModuleStaff.getPhone());
        staff.setPhoneNumber(staffModuleStaff.getPhoneNumber());
        
        // Date fields
        staff.setDateOfBirth(staffModuleStaff.getDateOfBirth());
        staff.setJoinDate(staffModuleStaff.getJoiningDate());
        staff.setJoiningDate(staffModuleStaff.getJoiningDate());
        
        // Additional fields
        staff.setAddress(staffModuleStaff.getAddress());
        staff.setDepartment(staffModuleStaff.getDepartment());
        staff.setDesignation(staffModuleStaff.getDesignation());
        
        // The role in StaffModule is a String, but in Core it's a StaffRole entity
        // We need to handle this difference
        if (staffModuleStaff.getRole() != null) {
            // We can't directly set the String role to the StaffRole field
            // Instead, we need to use reflection to set the legacy String role field
            try {
                java.lang.reflect.Field roleField = Staff.class.getDeclaredField("role");
                roleField.setAccessible(true);
                roleField.set(staff, staffModuleStaff.getRole());
            } catch (Exception e) {
                // If reflection fails, log the error but don't break the conversion
                System.err.println("Failed to set role field: " + e.getMessage());
            }
        }
        
        // Set isActive/active
        if (staffModuleStaff.isActive()) {
            staff.setIsActive(true);
            staff.setActive(true);
        } else {
            staff.setIsActive(false);
            staff.setActive(false);
        }
        
        // Map additional fields from staffModuleStaff to staff
        // These fields have been added to match the CSV template
        staff.setQualifications(staffModuleStaff.getQualifications());
        staff.setEmergencyContact(staffModuleStaff.getEmergencyContact());
        staff.setBloodGroup(staffModuleStaff.getBloodGroup());
        staff.setGender(staffModuleStaff.getGender());
        staff.setPfUAN(staffModuleStaff.getPfUAN());
        staff.setGratuity(staffModuleStaff.getGratuity());
        staff.setServiceEndDate(staffModuleStaff.getServiceEndDate());
        staff.setBasicSalary(staffModuleStaff.getBasicSalary());
        staff.setHra(staffModuleStaff.getHra());
        staff.setDa(staffModuleStaff.getDa());
        staff.setProfileImage(staffModuleStaff.getProfileImage());
        
        return staff;
    }
    
    /**
     * Helper method to try setting a field value using reflection
     */
    private void trySetField(Object source, Object target, String getterName, String setterName) {
        try {
            java.lang.reflect.Method getter = source.getClass().getMethod(getterName);
            if (getter != null) {
                Object value = getter.invoke(source);
                if (value != null) {
                    java.lang.reflect.Method setter = findSetter(target.getClass(), setterName, value.getClass());
                    if (setter != null) {
                        setter.invoke(target, value);
                    }
                }
            }
        } catch (Exception e) {
            // Field doesn't exist or couldn't be accessed, ignore
        }
    }
    
    /**
     * Find a setter method that can accept the given value type
     */
    private java.lang.reflect.Method findSetter(Class<?> clazz, String setterName, Class<?> valueType) {
        try {
            return clazz.getMethod(setterName, valueType);
        } catch (NoSuchMethodException e) {
            // Try to find a compatible setter
            for (java.lang.reflect.Method method : clazz.getMethods()) {
                if (method.getName().equals(setterName) && method.getParameterCount() == 1) {
                    Class<?> paramType = method.getParameterTypes()[0];
                    if (paramType.isAssignableFrom(valueType)) {
                        return method;
                    }
                }
            }
        }
        return null;
    }
}
