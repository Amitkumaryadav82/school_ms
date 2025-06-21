package com.school.hrm.model;

/**
 * Enum representing the employment status of a staff member.
 * @deprecated This enum is deprecated in favor of com.school.core.model.EmploymentStatus.
 */
@Deprecated
public enum EmploymentStatus {
    ACTIVE, 
    INACTIVE, 
    PROBATION, 
    TERMINATED, 
    LEAVE_OF_ABSENCE, 
    RETIRED, 
    CONTRACT,
    SUSPENDED,
    RESIGNED
}
