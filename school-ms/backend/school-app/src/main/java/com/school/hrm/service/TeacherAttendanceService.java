package com.school.hrm.service;

import com.school.hrm.dto.TeacherAttendanceDTO;
import com.school.hrm.dto.BulkAttendanceRequestDTO;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface TeacherAttendanceService {
    // Single record operations
    TeacherAttendanceDTO markAttendance(TeacherAttendanceDTO attendanceDTO);

    TeacherAttendanceDTO updateAttendance(Long id, TeacherAttendanceDTO attendanceDTO);

    TeacherAttendanceDTO getAttendanceById(Long id);

    void deleteAttendance(Long id);

    // Bulk operations
    List<TeacherAttendanceDTO> markBulkAttendance(BulkAttendanceRequestDTO bulkRequest);

    Map<String, Object> processAttendanceFile(MultipartFile file);

    // Query operations
    List<TeacherAttendanceDTO> getAttendanceByDate(LocalDate date);

    List<TeacherAttendanceDTO> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate);

    List<TeacherAttendanceDTO> getAttendanceByEmployee(Long employeeId);

    List<TeacherAttendanceDTO> getAttendanceByEmployeeAndDateRange(
            Long employeeId, LocalDate startDate, LocalDate endDate);

    // Template download
    byte[] generateAttendanceTemplate();

    // Reports and analytics
    Map<String, Object> getAttendanceStatsByEmployee(Long employeeId, LocalDate startDate, LocalDate endDate);

    Map<String, Object> getAttendanceOverview(LocalDate startDate, LocalDate endDate);

    Map<String, Object> getMonthlyAttendanceReport(int year, int month);
}
