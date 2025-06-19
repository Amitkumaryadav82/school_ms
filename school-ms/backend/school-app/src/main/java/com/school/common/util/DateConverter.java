package com.school.common.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

/**
 * Utility class for converting between java.util.Date and java.time.* classes.
 * This helps with the migration between different date/time APIs.
 */
public class DateConverter {

    /**
     * Convert LocalDate to Date
     * 
     * @param localDate the LocalDate to convert
     * @return Date equivalent, or null if input is null
     */
    public static Date toDate(LocalDate localDate) {
        if (localDate == null) {
            return null;
        }
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
    
    /**
     * Convert LocalDateTime to Date
     * 
     * @param localDateTime the LocalDateTime to convert
     * @return Date equivalent, or null if input is null
     */
    public static Date toDate(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }
    
    /**
     * Convert Date to LocalDate
     * 
     * @param date the Date to convert
     * @return LocalDate equivalent, or null if input is null
     */
    public static LocalDate convertToLocalDate(Date date) {
        if (date == null) {
            return null;
        }
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }
    
    /**
     * Convert Date to LocalDateTime
     * 
     * @param date the Date to convert
     * @return LocalDateTime equivalent, or null if input is null
     */
    public static LocalDateTime convertToLocalDateTime(Date date) {
        if (date == null) {
            return null;
        }
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }
    
    /**
     * Alias for convertToLocalDate for better naming consistency
     * 
     * @param date the Date to convert
     * @return LocalDate equivalent, or null if input is null
     */
    public static LocalDate toLocalDate(Date date) {
        return convertToLocalDate(date);
    }
    
    /**
     * Alias for convertToLocalDateTime for better naming consistency
     * 
     * @param date the Date to convert
     * @return LocalDateTime equivalent, or null if input is null
     */
    public static LocalDateTime toLocalDateTime(Date date) {
        return convertToLocalDateTime(date);
    }
}
