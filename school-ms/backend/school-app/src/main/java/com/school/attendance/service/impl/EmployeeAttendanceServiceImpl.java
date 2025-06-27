package com.school.attendance.service.impl;

import com.school.attendance.dto.EmployeeBulkAttendanceRequest;
import com.school.attendance.dto.EmployeeAttendanceDTO;
import com.school.attendance.model.EmployeeAttendanceStatus;
import com.school.attendance.model.StaffAttendance;
import com.school.attendance.model.StaffAttendanceStatus;
import com.school.attendance.repository.StaffAttendanceRepository;
import com.school.attendance.service.EmployeeAttendanceService;
import com.school.core.model.Staff;
import com.school.core.repository.StaffRepository;
import com.school.hrm.service.HolidayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementation of the EmployeeAttendanceService using database storage
 */
@Service
public class EmployeeAttendanceServiceImpl implements EmployeeAttendanceService {

    private final HolidayService holidayService;
    private final StaffAttendanceRepository staffAttendanceRepository;
    private final StaffRepository staffRepository;
    
    @Autowired
    public EmployeeAttendanceServiceImpl(
        HolidayService holidayService,
        StaffAttendanceRepository staffAttendanceRepository,
        StaffRepository staffRepository
    ) {
        this.holidayService = holidayService;
        this.staffAttendanceRepository = staffAttendanceRepository;
        this.staffRepository = staffRepository;
    }
    
    @Override
    @Transactional
    public EmployeeAttendanceDTO createAttendance(EmployeeAttendanceDTO attendanceDTO) {
        // Check if the date is a holiday, and if so, mark it automatically
        if (isHoliday(attendanceDTO.getAttendanceDate())) {
            attendanceDTO.setStatus(EmployeeAttendanceStatus.HOLIDAY);
            
            // Add the holiday name to the reason field
            String holidayName = com.school.hrm.util.HolidayThreadLocal.getHolidayName();
            if (holidayName != null && !holidayName.isEmpty()) {
                attendanceDTO.setReason("Holiday: " + holidayName);
                
                // Add description if available
                String description = com.school.hrm.util.HolidayThreadLocal.getHolidayDescription();
                if (description != null && !description.isEmpty()) {
                    attendanceDTO.setReason(attendanceDTO.getReason() + " - " + description);
                }
            } else {
                attendanceDTO.setReason("Holiday (System Generated)");
            }
            
            // Clear thread local after use
            com.school.hrm.util.HolidayThreadLocal.clear();
        }
        
        // Find the staff entity by employee ID with role eagerly loaded
        Staff staff;
        try {
            // Use the new method that eagerly loads the StaffRole
            staff = staffRepository.findByIdWithRole(attendanceDTO.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Staff not found with id: " + attendanceDTO.getEmployeeId()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to find staff with ID: " + attendanceDTO.getEmployeeId() + 
                ". Please ensure the staff exists in the school_staff table.", e);
        }
        
        try {
            // Debug logging
            System.out.println("Attempting to mark attendance for staff ID: " + staff.getId() + 
                " (" + staff.getFirstName() + " " + staff.getLastName() + ") on date: " + 
                attendanceDTO.getAttendanceDate());
            
            // Explicitly check if attendance record already exists for this staff and date
            StaffAttendance existingAttendance = staffAttendanceRepository.findByStaffIdAndAttendanceDate(
                attendanceDTO.getEmployeeId(), 
                attendanceDTO.getAttendanceDate()
            );
            
            // If exists, update it instead of creating a new record
            if (existingAttendance != null) {
                System.out.println("Found existing attendance record with ID: " + existingAttendance.getId() + 
                    " for staff ID: " + staff.getId() + " on date: " + attendanceDTO.getAttendanceDate() + 
                    " - updating record");
                
                // Update existing record fields
                existingAttendance.setStatus(convertEmployeeStatusToStaffStatus(attendanceDTO.getStatus()));
                existingAttendance.setNote(attendanceDTO.getReason());
                
                // Save the updated entity
                StaffAttendance savedAttendance = staffAttendanceRepository.save(existingAttendance);
                
                System.out.println("Successfully updated attendance record with ID: " + savedAttendance.getId());
                
                // Convert back to DTO and return
                return convertToDTO(savedAttendance);
            }
            
            System.out.println("No existing attendance record found - creating new record for staff ID: " + 
                staff.getId() + " on date: " + attendanceDTO.getAttendanceDate());
            
            // If no record exists, create a new one
            StaffAttendance staffAttendance = new StaffAttendance();
            staffAttendance.setStaff(staff);
            staffAttendance.setAttendanceDate(attendanceDTO.getAttendanceDate());
            staffAttendance.setStatus(convertEmployeeStatusToStaffStatus(attendanceDTO.getStatus()));
            staffAttendance.setNote(attendanceDTO.getReason());
            
            // Save to database
            StaffAttendance savedAttendance = staffAttendanceRepository.save(staffAttendance);
            
            System.out.println("Successfully created new attendance record with ID: " + savedAttendance.getId());
            
            // Convert back to DTO and return
            return convertToDTO(savedAttendance);
        } catch (Exception e) {
            // Log the error in detail
            System.err.println("Error creating/updating attendance record: " + e.getMessage());
            e.printStackTrace();
            
            if (e.getMessage() != null && e.getMessage().contains("staff_attendance_staff_id_fkey")) {
                throw new RuntimeException("Foreign key constraint error: The staff ID " + attendanceDTO.getEmployeeId() + 
                    " does not exist in the school_staff table. Please ensure you are using a valid staff ID.", e);
            } else if (e.getMessage() != null && e.getMessage().contains("unique_staff_date")) {
                throw new RuntimeException("Duplicate record: An attendance record already exists for staff ID " + 
                    attendanceDTO.getEmployeeId() + " on date " + attendanceDTO.getAttendanceDate() + 
                    ". Try updating the existing record instead.", e);
            } else {
                // Re-throw a more specific exception
                throw new RuntimeException("The operation could not be completed due to a data constraint violation: " + 
                    e.getMessage(), e);
            }
        }
    }

    @Override
    @Transactional
    public List<EmployeeAttendanceDTO> createBulkAttendance(EmployeeBulkAttendanceRequest request) {
        List<EmployeeAttendanceDTO> createdAttendances = new ArrayList<>();
        LocalDate attendanceDate = request.getAttendanceDate();
        
        // Check if the date is a holiday
        boolean isDateHoliday = isHoliday(attendanceDate);
        
        // Process each employee attendance
        for (Map.Entry<Long, EmployeeAttendanceStatus> entry : request.getAttendanceMap().entrySet()) {
            try {
                Long employeeId = entry.getKey();
                
                // Find the staff entity with role eagerly loaded
                Optional<Staff> staffOpt = staffRepository.findByIdWithRole(employeeId);
                if (!staffOpt.isPresent()) {
                    continue; // Skip if staff doesn't exist
                }
                Staff staff = staffOpt.get();
                
                // Create attendance DTO
                EmployeeAttendanceDTO attendanceDTO = new EmployeeAttendanceDTO();
                attendanceDTO.setEmployeeId(employeeId);
                attendanceDTO.setAttendanceDate(attendanceDate);
                
                // If it's a holiday, override the status
                if (isDateHoliday) {
                    attendanceDTO.setStatus(EmployeeAttendanceStatus.HOLIDAY);
                } else {
                    attendanceDTO.setStatus(entry.getValue());
                }
                
                attendanceDTO.setRemarks(request.getRemarks());
                
                // Use the updated createAttendance method for each entry
                // This will handle duplicate checks and update vs. insert logic
                createdAttendances.add(createAttendance(attendanceDTO));
            } catch (Exception e) {
                // Log the error but continue processing other entries
                System.err.println("Error processing attendance for employee ID " + entry.getKey() + ": " + e.getMessage());
                // We don't throw here to allow other records to be processed
            }
        }
        
        return createdAttendances;
    }

    @Override
    public Map<String, Object> processAttendanceFile(MultipartFile file, String employeeType) throws Exception {
        // TODO: Implement file processing logic
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("processed", 0);
        result.put("errors", new ArrayList<>());
        return result;
    }

    @Override
    @Transactional
    public List<EmployeeAttendanceDTO> getAttendanceByDate(LocalDate date, String employeeType) {
        System.out.println("getAttendanceByDate called for date: " + date + ", employeeType: " + employeeType);
        
        // Check if the day is a holiday
        boolean isDateHoliday = isHoliday(date);
        System.out.println("Date " + date + " is holiday: " + isDateHoliday);
        
        // Find existing records for the given date
        List<StaffAttendance> staffAttendanceList = staffAttendanceRepository.findByAttendanceDate(date);
        System.out.println("Found " + staffAttendanceList.size() + " existing attendance records for date: " + date);
        
        // If it's a holiday and no attendance records exist, create HOLIDAY records for all staff
        if (isDateHoliday && staffAttendanceList.isEmpty()) {
            System.out.println("Creating holiday attendance records for all staff since it's a holiday and no records exist");
            createHolidayAttendanceForAllStaff(date);
            // Fetch the newly created records
            staffAttendanceList = staffAttendanceRepository.findByAttendanceDate(date);
            System.out.println("After creating holiday records, found " + staffAttendanceList.size() + " attendance records");
        } else if (isDateHoliday) {
            System.out.println("It's a holiday but attendance records already exist - not creating new ones");
        } else {
            System.out.println("Not a holiday - proceeding with regular attendance processing");
        }
        
        // Convert to DTOs
        List<EmployeeAttendanceDTO> attendanceList = staffAttendanceList.stream()
            .filter(attendance -> filterByEmployeeType(attendance, employeeType))
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        
        return attendanceList;
    }
    
    private boolean filterByEmployeeType(StaffAttendance attendance, String employeeType) {
        if ("ALL".equalsIgnoreCase(employeeType)) {
            return true;
        }
        
        // Add robust null checking
        if (attendance == null || attendance.getStaff() == null) {
            return false;
        }
        
        String staffRole = null;
        try {
            if (attendance.getStaff().getStaffRole() != null) {
                staffRole = attendance.getStaff().getStaffRole().getName();
            }
        } catch (Exception e) {
            System.err.println("Error accessing staff role: " + e.getMessage());
        }
            
        if ("TEACHING".equalsIgnoreCase(employeeType)) {
            return staffRole != null && staffRole.toLowerCase().contains("teacher");
        } else if ("NON_TEACHING".equalsIgnoreCase(employeeType)) {
            return staffRole == null || !staffRole.toLowerCase().contains("teacher");
        }
        
        return false;
    }

    @Override
    public List<EmployeeAttendanceDTO> getAttendanceByEmployeeId(Long employeeId) {
        // Retrieve attendance records for the employee
        List<StaffAttendance> staffAttendanceList = staffAttendanceRepository.findByStaffId(employeeId);
        
        // Convert to DTOs
        return staffAttendanceList.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public EmployeeAttendanceDTO getAttendanceByEmployeeIdAndDate(Long employeeId, LocalDate date) {
        // Find the attendance record
        StaffAttendance staffAttendance = staffAttendanceRepository.findByStaffIdAndAttendanceDate(employeeId, date);
        
        // Return null if not found
        if (staffAttendance == null) {
            return null;
        }
        
        // Convert to DTO
        return convertToDTO(staffAttendance);
    }

    @Override
    public List<EmployeeAttendanceDTO> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate, String employeeType) {
        // Retrieve attendance records in the date range
        List<StaffAttendance> staffAttendanceList = staffAttendanceRepository.findByAttendanceDateBetween(startDate, endDate);
        
        // Filter and convert to DTOs
        return staffAttendanceList.stream()
            .filter(attendance -> filterByEmployeeType(attendance, employeeType))
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<EmployeeAttendanceDTO> getAttendanceByEmployeeIdAndDateRange(Long employeeId, LocalDate startDate, LocalDate endDate) {
        // Retrieve attendance records
        List<StaffAttendance> staffAttendanceList = staffAttendanceRepository.findByStaffIdAndAttendanceDateBetween(
            employeeId, startDate, endDate);
        
        // Convert to DTOs
        return staffAttendanceList.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EmployeeAttendanceDTO updateAttendance(Long id, EmployeeAttendanceDTO attendanceDTO) {
        // Find the existing record with eager loading of staff
        StaffAttendance staffAttendance = staffAttendanceRepository.findByIdWithStaff(id)
            .orElseThrow(() -> new EntityNotFoundException("Attendance record not found with id: " + id));
        
        // Update the entity
        staffAttendance.setStatus(convertEmployeeStatusToStaffStatus(attendanceDTO.getStatus()));
        staffAttendance.setNote(attendanceDTO.getReason());
        
        // Save to database
        StaffAttendance savedAttendance = staffAttendanceRepository.save(staffAttendance);
        
        // Convert back to DTO
        return convertToDTO(savedAttendance);
    }

    @Override
    @Transactional
    public void deleteAttendance(Long id) {
        // Check if record exists
        if (!staffAttendanceRepository.existsById(id)) {
            throw new EntityNotFoundException("Attendance record not found with id: " + id);
        }
        
        // Delete from database
        staffAttendanceRepository.deleteById(id);
    }

    @Override
    public Map<String, Object> getMonthlyAttendanceReport(int year, int month, String employeeType) {
        // TODO: Implement report generation
        Map<String, Object> report = new HashMap<>();
        return report;
    }
    
    @Override
    public Map<String, Object> getEmployeeAttendanceStats(Long employeeId, LocalDate startDate, LocalDate endDate) {
        // TODO: Implement employee stats
        Map<String, Object> stats = new HashMap<>();
        return stats;
    }
    
    @Override
    public Map<EmployeeAttendanceStatus, Long> getOverallAttendanceStats(LocalDate startDate, LocalDate endDate, String employeeType) {
        // TODO: Implement overall stats
        Map<EmployeeAttendanceStatus, Long> stats = new HashMap<>();
        return stats;
    }

    @Override
    public boolean isHoliday(LocalDate date) {
        Map<String, Boolean> holidayCheck = holidayService.checkIfHoliday(date);
        boolean isHoliday = holidayCheck.getOrDefault("isHoliday", false);
        System.out.println("Checking if " + date + " is a holiday: " + isHoliday);
        return isHoliday;
    }
    
    // Conversion methods
    
    private EmployeeAttendanceDTO convertToDTO(StaffAttendance staffAttendance) {
        EmployeeAttendanceDTO dto = new EmployeeAttendanceDTO();
        
        dto.setId(staffAttendance.getId());
        dto.setEmployeeId(staffAttendance.getStaff().getId());
        dto.setEmployeeName(staffAttendance.getStaff().getFirstName() + " " + staffAttendance.getStaff().getLastName());
        
        // Set email if available
        if (staffAttendance.getStaff().getEmail() != null) {
            dto.setEmployeeEmail(staffAttendance.getStaff().getEmail());
        }
        
        // Set department if available
        if (staffAttendance.getStaff().getDepartment() != null) {
            dto.setDepartment(staffAttendance.getStaff().getDepartment());
        }
        
        // Set position/designation if available
        if (staffAttendance.getStaff().getDesignation() != null) {
            dto.setPosition(staffAttendance.getStaff().getDesignation());
        }
        
        // Set employee type based on role - with improved null checking
        try {
            String staffRole = null;
            if (staffAttendance.getStaff() != null && 
                staffAttendance.getStaff().getStaffRole() != null &&
                staffAttendance.getStaff().getStaffRole().getName() != null) {
                staffRole = staffAttendance.getStaff().getStaffRole().getName();
                
                if (staffRole.toLowerCase().contains("teacher")) {
                    dto.setEmployeeType("TEACHING");
                } else {
                    dto.setEmployeeType("NON_TEACHING");
                }
            } else {
                // Default if role is null
                dto.setEmployeeType("NON_TEACHING");
                System.out.println("Staff role was null for staff ID: " + staffAttendance.getStaff().getId());
            }
        } catch (Exception e) {
            // Default to NON_TEACHING if there's any issue with role determination
            dto.setEmployeeType("NON_TEACHING");
            System.err.println("Error determining employee type: " + e.getMessage());
        }
        
        dto.setAttendanceDate(staffAttendance.getAttendanceDate());
        dto.setStatus(convertStaffStatusToEmployeeStatus(staffAttendance.getStatus()));
        dto.setReason(staffAttendance.getNote());
        
        // Set audit fields
        if (staffAttendance.getCreatedBy() != null) {
            dto.setMarkedBy(staffAttendance.getCreatedBy());
        }
        
        // Set creation and update timestamps
        dto.setCreatedAt(staffAttendance.getCreatedAt());
        dto.setUpdatedAt(staffAttendance.getUpdatedAt());
        
        return dto;
    }
    
    private StaffAttendanceStatus convertEmployeeStatusToStaffStatus(EmployeeAttendanceStatus status) {
        switch (status) {
            case PRESENT:
                return StaffAttendanceStatus.PRESENT;
            case ABSENT:
                return StaffAttendanceStatus.ABSENT;
            case HALF_DAY:
                return StaffAttendanceStatus.HALF_DAY;
            case ON_LEAVE:
                return StaffAttendanceStatus.ON_LEAVE;
            case LATE:
                return StaffAttendanceStatus.LATE;
            case HOLIDAY:
                return StaffAttendanceStatus.HOLIDAY;
            default:
                return StaffAttendanceStatus.ABSENT;
        }
    }
    
    private EmployeeAttendanceStatus convertStaffStatusToEmployeeStatus(StaffAttendanceStatus status) {
        switch (status) {
            case PRESENT:
                return EmployeeAttendanceStatus.PRESENT;
            case ABSENT:
                return EmployeeAttendanceStatus.ABSENT;
            case HALF_DAY:
                return EmployeeAttendanceStatus.HALF_DAY;
            case ON_LEAVE:
                return EmployeeAttendanceStatus.ON_LEAVE;
            case LATE:
                return EmployeeAttendanceStatus.LATE;
            case HOLIDAY:
                return EmployeeAttendanceStatus.HOLIDAY;
            default:
                return EmployeeAttendanceStatus.ABSENT;
        }
    }
    
    /**
     * Creates holiday attendance records for all active staff members
     * This method is called when a day is a holiday and no attendance records exist yet
     * 
     * @param date The holiday date
     */
    @Transactional
    private void createHolidayAttendanceForAllStaff(LocalDate date) {
        System.out.println("Creating holiday attendance records for all active staff on " + date);
        
        // Get holiday information
        Map<String, Boolean> holidayInfo = holidayService.checkIfHoliday(date);
        String holidayName = com.school.hrm.util.HolidayThreadLocal.getHolidayName();
        String holidayDescription = com.school.hrm.util.HolidayThreadLocal.getHolidayDescription();
        
        // Prepare the note text
        String noteText = "Auto-generated for holiday";
        if (holidayName != null && !holidayName.isEmpty()) {
            noteText = "Holiday: " + holidayName;
            if (holidayDescription != null && !holidayDescription.isEmpty()) {
                noteText += " - " + holidayDescription;
            }
        }
        
        // Get all active staff
        List<Staff> allActiveStaff = staffRepository.findByIsActiveTrue();
        System.out.println("Found " + allActiveStaff.size() + " active staff members");
        
        // Create a holiday attendance record for each staff member
        for (Staff staff : allActiveStaff) {
            System.out.println("Processing staff: " + staff.getId() + " - " + staff.getFirstName() + " " + staff.getLastName());
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
            } else {
                // Update existing attendance to HOLIDAY if it's not already
                if (existing.getStatus() != StaffAttendanceStatus.HOLIDAY) {
                    existing.setStatus(StaffAttendanceStatus.HOLIDAY);
                    existing.setNote(noteText + " (Updated automatically)");
                    staffAttendanceRepository.save(existing);
                }
            }
        }
        
        // Clear thread local after use
        com.school.hrm.util.HolidayThreadLocal.clear();
        
        System.out.println("Created holiday attendance records for " + allActiveStaff.size() + " staff members");
    }
}
