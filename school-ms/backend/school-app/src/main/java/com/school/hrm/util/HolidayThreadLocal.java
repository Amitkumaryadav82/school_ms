package com.school.hrm.util;

/**
 * Utility class for storing holiday information in ThreadLocal variables.
 * This allows us to pass holiday details between layers without modifying method signatures.
 */
public class HolidayThreadLocal {
    private static final ThreadLocal<String> holidayName = new ThreadLocal<>();
    private static final ThreadLocal<String> holidayDescription = new ThreadLocal<>();
    
    public static void setHolidayName(String name) {
        holidayName.set(name);
    }
    
    public static String getHolidayName() {
        return holidayName.get();
    }
    
    public static void setHolidayDescription(String description) {
        holidayDescription.set(description);
    }
    
    public static String getHolidayDescription() {
        return holidayDescription.get();
    }
    
    public static void clear() {
        holidayName.remove();
        holidayDescription.remove();
    }
}
