package com.school.core.model;

/**
 * Enum representing the employment status of a staff member.
 * Migrated from com.school.hrm.model.EmploymentStatus
 * Only ACTIVE, TERMINATED, RETIRED, and RESIGNED should be used going forward.
 */
public enum EmploymentStatus {
    ACTIVE, 
    INACTIVE, 
    PROBATION, 
    TERMINATED, 
    LEAVE_OF_ABSENCE, 
    RETIRED, 
    CONTRACT,
    RESIGNED
}
