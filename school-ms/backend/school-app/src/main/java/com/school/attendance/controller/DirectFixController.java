package com.school.attendance.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.school.attendance.service.HolidayAttendanceService;

/**
 * Controller for direct database fixes for holiday attendance issues
 */
@RestController
@RequestMapping("/api/debug/direct-fixes")
public class DirectFixController {

    @PersistenceContext
    private EntityManager entityManager;
    
    @Autowired
    private HolidayAttendanceService holidayAttendanceService;
    
    /**
     * Fix staff with null departments
     */
    @PostMapping("/fix-null-departments")
    @Transactional
    public ResponseEntity<Map<String, Object>> fixNullDepartments(
            @RequestParam(defaultValue = "General Administration") String defaultDepartment) {
        
        String sql = "UPDATE school_staff SET department = :dept WHERE department IS NULL";
        Query query = entityManager.createNativeQuery(sql)
                .setParameter("dept", defaultDepartment);
        
        int updated = query.executeUpdate();
        
        Map<String, Object> result = new HashMap<>();
        result.put("recordsUpdated", updated);
        result.put("defaultDepartment", defaultDepartment);
        result.put("message", "Updated " + updated + " staff records with null departments");
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Fix attendance records for a holiday date
     */
    @PostMapping("/fix-holiday-attendance")
    @Transactional
    public ResponseEntity<Map<String, Object>> fixHolidayAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        // First check if it's a holiday
        boolean isHoliday = holidayAttendanceService.isHoliday(date);
        
        if (!isHoliday) {
            Map<String, Object> result = new HashMap<>();
            result.put("message", "The specified date is not a holiday");
            result.put("date", date);
            return ResponseEntity.ok(result);
        }
        
        // Get holiday details
        String sql = "SELECT name, description, type FROM school_holidays WHERE date = :date";
        Object[] holidayInfo = (Object[]) entityManager.createNativeQuery(sql)
                .setParameter("date", date)
                .getSingleResult();
        
        String holidayName = (String) holidayInfo[0];
        String holidayDesc = (String) holidayInfo[1];
        String note = "Holiday: " + holidayName;
        if (holidayDesc != null && !holidayDesc.isEmpty()) {
            note += " - " + holidayDesc;
        }
        
        // Update all attendance records for this date to HOLIDAY
        String updateSql = "UPDATE staff_attendance SET status = 'HOLIDAY', note = :note " +
                        "WHERE attendance_date = :date AND status != 'HOLIDAY'";
        
        Query updateQuery = entityManager.createNativeQuery(updateSql)
                .setParameter("note", note)
                .setParameter("date", date);
        
        int updated = updateQuery.executeUpdate();
        
        // Now ensure all staff have attendance records
        int created = holidayAttendanceService.ensureHolidayAttendance(date);
        
        Map<String, Object> result = new HashMap<>();
        result.put("date", date);
        result.put("holidayName", holidayName);
        result.put("recordsUpdated", updated);
        result.put("recordsCreated", created);
        result.put("message", "Successfully processed holiday attendance for " + date);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Fix all holiday attendance records
     */
    @PostMapping("/fix-all-holiday-attendance")
    @Transactional
    public ResponseEntity<Map<String, Object>> fixAllHolidayAttendance() {
        
        // Get all holiday dates
        String dateSql = "SELECT date FROM school_holidays";
        @SuppressWarnings("unchecked")
        java.util.List<java.sql.Date> dates = entityManager.createNativeQuery(dateSql).getResultList();
        
        int totalFixed = 0;
        
        // Process each holiday date
        for (java.sql.Date sqlDate : dates) {
            LocalDate date = sqlDate.toLocalDate();
            
            // Get holiday details
            String sql = "SELECT name, description, type FROM school_holidays WHERE date = :date";
            Object[] holidayInfo = (Object[]) entityManager.createNativeQuery(sql)
                    .setParameter("date", date)
                    .getSingleResult();
            
            String holidayName = (String) holidayInfo[0];
            String holidayDesc = (String) holidayInfo[1];
            String note = "Holiday: " + holidayName;
            if (holidayDesc != null && !holidayDesc.isEmpty()) {
                note += " - " + holidayDesc;
            }
            
            // Update all attendance records for this date to HOLIDAY
            String updateSql = "UPDATE staff_attendance SET status = 'HOLIDAY', note = :note " +
                            "WHERE attendance_date = :date AND status != 'HOLIDAY'";
            
            Query updateQuery = entityManager.createNativeQuery(updateSql)
                    .setParameter("note", note)
                    .setParameter("date", date);
            
            totalFixed += updateQuery.executeUpdate();
            
            // Ensure all staff have attendance records
            holidayAttendanceService.ensureHolidayAttendance(date);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("holidaysProcessed", dates.size());
        result.put("recordsFixed", totalFixed);
        result.put("message", "Successfully processed all holiday attendance records");
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Fix staff with NULL or incorrect employment_status
     * This will set all staff with NULL or non-ACTIVE status to ACTIVE if they should be active
     */
    @PostMapping("/fix-employment-status")
    @Transactional
    public ResponseEntity<Map<String, Object>> fixEmploymentStatus() {
        // Update NULL employment_status to 'ACTIVE'
        String sqlNull = "UPDATE school_staff SET employment_status = 'ACTIVE' WHERE employment_status IS NULL";
        Query queryNull = entityManager.createNativeQuery(sqlNull);
        int updatedNull = queryNull.executeUpdate();
        
        // Get count of staff with non-ACTIVE status but is_active = true
        String countSql = "SELECT COUNT(*) FROM school_staff WHERE is_active = true AND employment_status != 'ACTIVE'";
        Long inconsistentCount = (Long) entityManager.createNativeQuery(countSql).getSingleResult();
        
        // Update staff with incorrect status (is_active = true but employment_status != 'ACTIVE')
        String sqlInconsistent = "UPDATE school_staff SET employment_status = 'ACTIVE' WHERE is_active = true AND employment_status != 'ACTIVE'";
        Query queryInconsistent = entityManager.createNativeQuery(sqlInconsistent);
        int updatedInconsistent = queryInconsistent.executeUpdate();
        
        Map<String, Object> result = new HashMap<>();
        result.put("nullStatusUpdated", updatedNull);
        result.put("inconsistentStatusFound", inconsistentCount);
        result.put("inconsistentStatusUpdated", updatedInconsistent);
        result.put("message", "Employment status fixes applied successfully");
        
        return ResponseEntity.ok(result);
    }
}
