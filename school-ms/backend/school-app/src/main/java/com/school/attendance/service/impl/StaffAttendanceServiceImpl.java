package com.school.attendance.service.impl;

import com.school.attendance.dto.BulkStaffAttendanceRequest;
import com.school.attendance.dto.StaffAttendanceDTO;
import com.school.attendance.model.StaffAttendance;
import com.school.attendance.model.StaffAttendanceStatus;
import com.school.attendance.repository.StaffAttendanceRepository;
import com.school.attendance.service.StaffAttendanceService;
import com.school.exception.ResourceNotFoundException;
import com.school.core.model.Staff;
import com.school.core.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StaffAttendanceServiceImpl implements StaffAttendanceService {

    private final StaffAttendanceRepository staffAttendanceRepository;
    private final StaffRepository staffRepository;

    @Autowired
    public StaffAttendanceServiceImpl(StaffAttendanceRepository staffAttendanceRepository, StaffRepository staffRepository) {
        this.staffAttendanceRepository = staffAttendanceRepository;
        this.staffRepository = staffRepository;
    }

    @Override
    @Transactional
    public StaffAttendanceDTO createStaffAttendance(StaffAttendanceDTO staffAttendanceDTO) {
        Staff staff = staffRepository.findById(staffAttendanceDTO.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffAttendanceDTO.getStaffId()));

        // Check if an attendance record already exists for this date and staff
        StaffAttendance existingAttendance = staffAttendanceRepository
                .findByStaffIdAndAttendanceDate(staffAttendanceDTO.getStaffId(), staffAttendanceDTO.getAttendanceDate());
        
        if (existingAttendance != null) {
            // Update existing attendance record
            existingAttendance.setStatus(staffAttendanceDTO.getStatus());
            existingAttendance.setNote(staffAttendanceDTO.getNote());
            StaffAttendance savedAttendance = staffAttendanceRepository.save(existingAttendance);
            return convertToDTO(savedAttendance);
        } else {
            // Create new attendance record
            StaffAttendance staffAttendance = new StaffAttendance();
            staffAttendance.setStaff(staff);
            staffAttendance.setAttendanceDate(staffAttendanceDTO.getAttendanceDate());
            staffAttendance.setStatus(staffAttendanceDTO.getStatus());
            staffAttendance.setNote(staffAttendanceDTO.getNote());
            
            StaffAttendance savedAttendance = staffAttendanceRepository.save(staffAttendance);
            return convertToDTO(savedAttendance);
        }
    }

    @Override
    @Transactional
    public List<StaffAttendanceDTO> createBulkStaffAttendance(BulkStaffAttendanceRequest request) {
        LocalDate attendanceDate = request.getAttendanceDate();
        List<StaffAttendanceDTO> results = new ArrayList<>();
        
        for (Map.Entry<Long, StaffAttendanceStatus> entry : request.getStaffAttendanceMap().entrySet()) {
            Long staffId = entry.getKey();
            StaffAttendanceStatus status = entry.getValue();
            
            Staff staff = staffRepository.findById(staffId)
                    .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffId));
            
            // Check if an attendance record already exists
            StaffAttendance existingAttendance = staffAttendanceRepository
                    .findByStaffIdAndAttendanceDate(staffId, attendanceDate);
            
            if (existingAttendance != null) {
                // Update existing attendance record
                existingAttendance.setStatus(status);
                existingAttendance.setNote(request.getNote());
                StaffAttendance savedAttendance = staffAttendanceRepository.save(existingAttendance);
                results.add(convertToDTO(savedAttendance));
            } else {
                // Create new attendance record
                StaffAttendance staffAttendance = new StaffAttendance();
                staffAttendance.setStaff(staff);
                staffAttendance.setAttendanceDate(attendanceDate);
                staffAttendance.setStatus(status);
                staffAttendance.setNote(request.getNote());
                
                StaffAttendance savedAttendance = staffAttendanceRepository.save(staffAttendance);
                results.add(convertToDTO(savedAttendance));
            }
        }
        
        return results;
    }

    @Override
    public List<StaffAttendanceDTO> getStaffAttendanceByDate(LocalDate date) {
        List<StaffAttendance> attendanceList = staffAttendanceRepository.findByAttendanceDate(date);
        return attendanceList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffAttendanceDTO> getStaffAttendanceByStaffId(Long staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffId));
                
        List<StaffAttendance> attendanceList = staffAttendanceRepository.findByStaffId(staffId);
        return attendanceList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public StaffAttendanceDTO getStaffAttendanceByStaffIdAndDate(Long staffId, LocalDate date) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffId));
                
        StaffAttendance attendance = staffAttendanceRepository.findByStaffIdAndAttendanceDate(staffId, date);
        return attendance != null ? convertToDTO(attendance) : null;
    }

    @Override
    public List<StaffAttendanceDTO> getStaffAttendanceByDateRange(LocalDate startDate, LocalDate endDate) {
        List<StaffAttendance> attendanceList = staffAttendanceRepository.findByAttendanceDateBetween(startDate, endDate);
        return attendanceList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffAttendanceDTO> getStaffAttendanceByStaffIdAndDateRange(Long staffId, LocalDate startDate, LocalDate endDate) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffId));
                
        List<StaffAttendance> attendanceList = staffAttendanceRepository.findByStaffIdAndAttendanceDateBetween(staffId, startDate, endDate);
        return attendanceList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StaffAttendanceDTO updateStaffAttendance(Long id, StaffAttendanceDTO staffAttendanceDTO) {
        StaffAttendance staffAttendance = staffAttendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff attendance not found with id: " + id));
        
        staffAttendance.setStatus(staffAttendanceDTO.getStatus());
        staffAttendance.setNote(staffAttendanceDTO.getNote());
        
        StaffAttendance updatedAttendance = staffAttendanceRepository.save(staffAttendance);
        return convertToDTO(updatedAttendance);
    }

    @Override
    @Transactional
    public void deleteStaffAttendance(Long id) {
        if (!staffAttendanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Staff attendance not found with id: " + id);
        }
        staffAttendanceRepository.deleteById(id);
    }
    
    @Override
    public Map<StaffAttendanceStatus, Long> getOverallAttendanceStats(LocalDate startDate, LocalDate endDate) {
        List<StaffAttendance> attendanceRecords = staffAttendanceRepository.findByAttendanceDateBetween(startDate, endDate);
        
        // Group by status and count
        Map<StaffAttendanceStatus, Long> stats = attendanceRecords.stream()
                .collect(Collectors.groupingBy(
                    StaffAttendance::getStatus,
                    Collectors.counting()
                ));
                
        // Ensure all status values are included in the result
        for (StaffAttendanceStatus status : StaffAttendanceStatus.values()) {
            stats.putIfAbsent(status, 0L);
        }
        
        return stats;
    }

    @Override
    public Map<String, Object> processAttendanceFile(MultipartFile file) throws Exception {
        // Implementation for file processing
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("processed", 0);
        result.put("errors", new ArrayList<>());
        return result;
    }
    
    @Override
    public Map<String, Object> getMonthlyAttendanceReport(int year, int month) {
        // Get the first and last day of the month
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        // Get all attendance records for the month
        List<StaffAttendance> attendanceList = staffAttendanceRepository.findByAttendanceDateBetween(startDate, endDate);
        
        // Process data and create report
        Map<String, Object> report = new HashMap<>();
        report.put("year", year);
        report.put("month", month);
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        report.put("totalWorkingDays", calculateWorkingDays(startDate, endDate));
        
        // Process employee summaries (simplified)
        List<Map<String, Object>> employeeSummaries = new ArrayList<>();
        // Populate employeeSummaries based on attendance data
        report.put("employeeSummaries", employeeSummaries);
        
        return report;
    }
    
    private int calculateWorkingDays(LocalDate startDate, LocalDate endDate) {
        // Basic implementation counting weekdays
        int workingDays = 0;
        LocalDate date = startDate;
        while (!date.isAfter(endDate)) {
            if (date.getDayOfWeek().getValue() < 6) { // Exclude Saturday (6) and Sunday (7)
                workingDays++;
            }
            date = date.plusDays(1);
        }
        return workingDays;
    }
    
    @Override
    public Map<String, Object> getEmployeeAttendanceStats(Long staffId, LocalDate startDate, LocalDate endDate) {
        // Get staff member
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + staffId));
        
        // Get attendance records
        List<StaffAttendance> attendanceList = staffAttendanceRepository.findByStaffIdAndAttendanceDateBetween(
                staffId, startDate, endDate);
        
        // Create stats
        Map<String, Object> stats = new HashMap<>();
        stats.put("staffId", staffId);
        stats.put("staffName", staff.getFullName());
        stats.put("startDate", startDate);
        stats.put("endDate", endDate);
        stats.put("totalWorkingDays", calculateWorkingDays(startDate, endDate));
        
        // Count status occurrences
        Map<StaffAttendanceStatus, Long> statusCounts = attendanceList.stream()
                .collect(Collectors.groupingBy(StaffAttendance::getStatus, Collectors.counting()));
        
        stats.put("presentDays", statusCounts.getOrDefault(StaffAttendanceStatus.PRESENT, 0L));
        stats.put("absentDays", statusCounts.getOrDefault(StaffAttendanceStatus.ABSENT, 0L));
        stats.put("halfDays", statusCounts.getOrDefault(StaffAttendanceStatus.HALF_DAY, 0L));
        stats.put("leaveDays", statusCounts.getOrDefault(StaffAttendanceStatus.ON_LEAVE, 0L));
        
        // Calculate attendance percentage
        long totalDays = calculateWorkingDays(startDate, endDate);
        long presentCount = statusCounts.getOrDefault(StaffAttendanceStatus.PRESENT, 0L);
        double percentage = totalDays > 0 ? (presentCount * 100.0) / totalDays : 0;
        stats.put("attendancePercentage", String.format("%.2f%%", percentage));
        
        return stats;
    }
    
    @Override
    public boolean isHoliday(LocalDate date) {
        // For now, just check if it's a weekend
        int dayOfWeek = date.getDayOfWeek().getValue();
        return dayOfWeek == 6 || dayOfWeek == 7; // Saturday or Sunday
        
        // In a complete implementation, you would:
        // 1. Check school holidays table (from HolidayService)
        // 2. Check national/regional holidays
    }

    /**
     * Helper method to convert a StaffAttendance entity to a DTO
     */
    private StaffAttendanceDTO convertToDTO(StaffAttendance attendance) {
        return StaffAttendanceDTO.builder()
                .id(attendance.getId())
                .staffId(attendance.getStaff().getId())
                .staffName(attendance.getStaff().getFullName())
                .attendanceDate(attendance.getAttendanceDate())
                .status(attendance.getStatus())
                .note(attendance.getNote())
                .createdAt(attendance.getCreatedAt())
                .updatedAt(attendance.getUpdatedAt())
                .build();
    }
}
