package com.school.attendance.service;

import com.school.hrm.dto.HolidayDTO;
import java.time.LocalDate;

/**
 * Service interface for managing holiday-related attendance operations.
 */
public interface HolidayAttendanceService {
    
    /**
     * Checks if the specified date is a holiday.
     * 
     * @param date The date to check
     * @return true if the date is a holiday, false otherwise
     */
    boolean isHoliday(LocalDate date);
    
    /**
     * Gets holiday information for a specific date if it's a holiday.
     * 
     * @param date The date to check
     * @return HolidayDTO if the date is a holiday, null otherwise
     */
    HolidayDTO getHolidayDetails(LocalDate date);
    
    /**
     * Ensures that all active staff have attendance records with HOLIDAY status 
     * for the specified date if it's a holiday.
     * If records exist, they will be updated to HOLIDAY status.
     * 
     * @param date The date to process
     * @return The number of records created or updated
     */
    int ensureHolidayAttendance(LocalDate date);
    
    /**
     * Updates attendance to reflect the holiday status for all active staff
     * for all holidays in the system.
     * 
     * @return The number of records created or updated
     */
    int syncAllHolidaysAttendance();
}
