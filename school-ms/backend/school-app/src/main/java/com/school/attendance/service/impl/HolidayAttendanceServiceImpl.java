package com.school.attendance.service.impl;

import com.school.attendance.model.StaffAttendance;
import com.school.attendance.model.StaffAttendanceStatus;
import com.school.attendance.repository.StaffAttendanceRepository;
import com.school.attendance.service.HolidayAttendanceService;
import com.school.core.model.Staff;
import com.school.core.repository.StaffRepository;
import com.school.hrm.dto.HolidayDTO;
import com.school.hrm.model.Holiday;
import com.school.hrm.repository.HolidayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Implementation of the HolidayAttendanceService interface.
 */
@Service
public class HolidayAttendanceServiceImpl implements HolidayAttendanceService {

    private final HolidayRepository holidayRepository;
    private final StaffRepository staffRepository;
    private final StaffAttendanceRepository staffAttendanceRepository;

    @Autowired
    public HolidayAttendanceServiceImpl(
            HolidayRepository holidayRepository,
            StaffRepository staffRepository,
            StaffAttendanceRepository staffAttendanceRepository) {
        this.holidayRepository = holidayRepository;
        this.staffRepository = staffRepository;
        this.staffAttendanceRepository = staffAttendanceRepository;
    }

    @Override
    public boolean isHoliday(LocalDate date) {
        // Direct database query for better performance and reliability
        return holidayRepository.existsByDate(date);
    }

    @Override
    public HolidayDTO getHolidayDetails(LocalDate date) {
        Optional<Holiday> holidayOpt = holidayRepository.findByDate(date);
        if (!holidayOpt.isPresent()) {
            return null;
        }
        
        Holiday holiday = holidayOpt.get();
        return HolidayDTO.builder()
                .id(holiday.getId())
                .date(holiday.getDate())
                .name(holiday.getName())
                .description(holiday.getDescription())
                .type(holiday.getType())
                .build();
    }

    @Override
    @Transactional
    public int ensureHolidayAttendance(LocalDate date) {
        if (!isHoliday(date)) {
            // Not a holiday, nothing to do
            System.out.println("Date " + date + " is not a holiday - no action needed");
            return 0;
        }
        
        System.out.println("Ensuring holiday attendance for date " + date);
        
        // Get holiday details directly from repository
        Optional<Holiday> holidayOpt = holidayRepository.findByDate(date);
        if (!holidayOpt.isPresent()) {
            System.out.println("Holiday not found in repository despite isHoliday returning true");
            return 0;
        }
        Holiday holiday = holidayOpt.get();
        
        // Prepare note text with holiday information
        String noteText = "Holiday: " + holiday.getName();
        if (holiday.getDescription() != null && !holiday.getDescription().isEmpty()) {
            noteText += " - " + holiday.getDescription();
        }
        
        // Get all active staff with roles eagerly loaded
        List<Staff> activeStaff = staffRepository.findAllActiveStaffWithRole();
        System.out.println("Found " + activeStaff.size() + " active staff members");
        
        int recordsUpdated = 0;
        
        // Create or update attendance records for all active staff
        for (Staff staff : activeStaff) {
            try {
                System.out.println("Processing staff: " + staff.getId() + " - " + staff.getFullName() + 
                                  ", Department: " + (staff.getDepartment() != null ? staff.getDepartment() : "None"));
                
                // Check if attendance record already exists
                StaffAttendance existing = staffAttendanceRepository.findByStaffIdAndAttendanceDate(staff.getId(), date);
                
                if (existing == null) {
                    // Create new holiday attendance
                    StaffAttendance attendance = new StaffAttendance();
                    attendance.setStaff(staff);
                    attendance.setAttendanceDate(date);
                    attendance.setStatus(StaffAttendanceStatus.HOLIDAY);
                    attendance.setNote(noteText);
                    
                    // Save to database
                    staffAttendanceRepository.save(attendance);
                    recordsUpdated++;
                    System.out.println("Created new HOLIDAY attendance for staff " + staff.getId() + " (" + staff.getFullName() + ")");
                } else {
                    // Always update existing attendance to HOLIDAY 
                    // This ensures all staff have HOLIDAY status on holidays
                    existing.setStatus(StaffAttendanceStatus.HOLIDAY);
                    existing.setNote(noteText);
                    staffAttendanceRepository.save(existing);
                    recordsUpdated++;
                    System.out.println("Updated existing attendance to HOLIDAY for staff " + staff.getId() + " (" + staff.getFullName() + ")");
                }
            } catch (Exception e) {
                System.err.println("Error processing holiday attendance for staff ID " + staff.getId() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        System.out.println("Holiday attendance processing complete - " + recordsUpdated + " records created/updated");
        return recordsUpdated;
    }

    @Override
    @Transactional
    public int syncAllHolidaysAttendance() {
        List<Holiday> allHolidays = holidayRepository.findAll();
        System.out.println("Syncing attendance for " + allHolidays.size() + " holidays");
        
        int totalUpdated = 0;
        for (Holiday holiday : allHolidays) {
            int updated = ensureHolidayAttendance(holiday.getDate());
            totalUpdated += updated;
        }
        
        return totalUpdated;
    }
}
