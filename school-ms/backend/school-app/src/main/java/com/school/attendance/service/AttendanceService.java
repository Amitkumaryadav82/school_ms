package com.school.attendance.service;

import com.school.attendance.dto.AttendanceDTO;
import com.school.attendance.dto.AttendanceAlert;
import com.school.attendance.model.Attendance;
import com.school.attendance.model.AttendanceStatus;
import com.school.attendance.dto.MonthlyAttendanceReport;
import com.school.attendance.dto.MonthlyAttendanceStats;
import com.school.attendance.dto.AttendanceSummary;
import com.school.attendance.dto.StudentAttendanceSummaryDTO;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
  void markAttendance(AttendanceDTO attendanceDTO);

  void markBulkAttendance(List<AttendanceDTO> attendanceDTOs);

  Attendance updateAttendance(Long id, AttendanceStatus status, String remarks);

  void markCheckOut(Long attendanceId);

  Attendance getAttendance(Long id);

  List<Attendance> getStudentAttendance(Long studentId);

  List<Attendance> getAttendanceByDate(LocalDate date);

  List<Attendance> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate);

  List<Attendance> getStudentAttendanceByDateRange(Long studentId, LocalDate startDate, LocalDate endDate);

  long getStudentAttendanceCount(Long studentId, AttendanceStatus status, LocalDate startDate, LocalDate endDate);

  List<Attendance> getGradeAttendance(Integer grade, LocalDate date);

  List<Attendance> getSectionAttendance(Integer grade, String section, LocalDate date);

  StudentAttendanceSummaryDTO getStudentAttendanceSummary(Long studentId, LocalDate startDate, LocalDate endDate);

  List<Attendance> markClassAttendance(Integer grade, String section, LocalDate date, AttendanceStatus defaultStatus,
      String remarks);

  MonthlyAttendanceReport generateMonthlyReport(Integer grade, String section, Integer year, Integer month);

  MonthlyAttendanceStats generateMonthlyStats(Integer grade, String section, Integer year, Integer month);

  void deleteAttendance(Long id);

  int deleteAttendanceOlderThan(LocalDate date);

  List<AttendanceAlert> generateAttendanceAlerts();

  /**
   * Admin-only helper to clear all attendance for a student (e.g., before
   * deleting the student).
   */
  void deleteAllForStudent(Long studentId);

  double getStudentAttendancePercentage(Long studentId, LocalDate startDate, LocalDate endDate);
}