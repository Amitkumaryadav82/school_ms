package com.school.attendance.service;

import com.school.attendance.dto.AttendanceDTO;
import com.school.attendance.model.Attendance;
import com.school.attendance.model.AttendanceStatus;
import com.school.attendance.repository.AttendanceRepository;
import com.school.communication.model.NotificationType;
import com.school.student.model.Student;
import com.school.student.repository.StudentRepository;
import com.school.communication.service.NotificationService;
import com.school.attendance.dto.MonthlyAttendanceReport;
import com.school.attendance.dto.MonthlyAttendanceStats;
import com.school.attendance.dto.AttendanceAlert;
import com.school.attendance.dto.StudentAttendanceSummaryDTO;
import com.school.exception.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public void markAttendance(AttendanceDTO attendanceDTO) {
        Student student = studentRepository.findById(attendanceDTO.getStudentId())
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));

    Attendance attendance = attendanceRepository
        .findByStudent_IdAndDate(attendanceDTO.getStudentId(), attendanceDTO.getDate())
                .orElse(new Attendance());

        attendance.setStudent(student);
        attendance.setDate(attendanceDTO.getDate());
        attendance.setStatus(attendanceDTO.getStatus());
        attendance.setRemarks(attendanceDTO.getRemarks());
        attendance.setCheckInTime(LocalTime.now());

        attendanceRepository.save(attendance);

        if (attendanceDTO.getStatus() == AttendanceStatus.ABSENT && student.getGuardianEmail() != null) {
            notificationService.sendAttendanceNotification(
                    student.getGuardianEmail(),
                    attendanceDTO.getDate(),
                    student.getFirstName() + " " + student.getLastName(),
                    NotificationType.EMAIL,
                    NotificationType.IN_APP);
        }
    }

    @Override
    public void markBulkAttendance(List<AttendanceDTO> attendanceDTOs) {
        for (AttendanceDTO dto : attendanceDTOs) {
            markAttendance(dto);
        }
    }

    @Override
    public Attendance updateAttendance(Long id, AttendanceStatus status, String remarks) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new AttendanceNotFoundException("Attendance record not found"));

        attendance.setStatus(status);
        attendance.setRemarks(remarks);
        return attendanceRepository.save(attendance);
    }

    @Override
    public void markCheckOut(Long attendanceId) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new AttendanceNotFoundException("Attendance record not found"));

        attendance.setCheckOutTime(LocalTime.now());
        attendanceRepository.save(attendance);
    }

    @Override
    public Attendance getAttendance(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new AttendanceNotFoundException("Attendance record not found"));
    }

    @Override
    public List<Attendance> getStudentAttendance(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new StudentNotFoundException("Student not found");
        }
    return attendanceRepository.findByStudent_Id(studentId);
    }

    @Override
    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    @Override
    public List<Attendance> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new InvalidDateRangeException("Start date cannot be after end date");
        }
        return attendanceRepository.findByDateBetween(startDate, endDate);
    }

    @Override
    public List<Attendance> getStudentAttendanceByDateRange(Long studentId, LocalDate startDate, LocalDate endDate) {
        if (!studentRepository.existsById(studentId)) {
            throw new StudentNotFoundException("Student not found");
        }
        if (startDate.isAfter(endDate)) {
            throw new InvalidDateRangeException("Start date cannot be after end date");
        }
    return attendanceRepository.findByStudent_IdAndDateBetween(studentId, startDate, endDate);
    }

    @Override
    public long getStudentAttendanceCount(Long studentId, AttendanceStatus status, LocalDate startDate,
            LocalDate endDate) {
        if (!studentRepository.existsById(studentId)) {
            throw new StudentNotFoundException("Student not found");
        }
        if (startDate.isAfter(endDate)) {
            throw new InvalidDateRangeException("Start date cannot be after end date");
        }
    return attendanceRepository.countByStudent_IdAndStatusAndDateBetween(studentId, status, startDate, endDate);
    }

    @Override
    public List<Attendance> getGradeAttendance(Integer grade, LocalDate date) {
    return attendanceRepository.findByStudent_GradeAndDate(grade, date);
    }

    @Override
    public List<Attendance> getSectionAttendance(Integer grade, String section, LocalDate date) {
    return attendanceRepository.findByStudent_GradeAndStudent_SectionAndDate(grade, section, date);
    }    @Override
    public StudentAttendanceSummaryDTO getStudentAttendanceSummary(Long studentId, LocalDate startDate, LocalDate endDate) {
        if (!studentRepository.existsById(studentId)) {
            throw new StudentNotFoundException("Student not found");
        }
        if (startDate.isAfter(endDate)) {
            throw new InvalidDateRangeException("Start date cannot be after end date");
        }

    List<Attendance> records = attendanceRepository.findByStudent_IdAndDateBetween(studentId, startDate, endDate);

        long totalDays = records.size();
        long presentDays = records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long absentDays = records.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        long lateDays = records.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();

        double attendancePercentage = totalDays > 0 ? (presentDays * 100.0) / totalDays : 0;

        return StudentAttendanceSummaryDTO.builder()
                .studentId(studentId)
                .startDate(startDate)
                .endDate(endDate)
                .totalDays(totalDays)
                .presentDays(presentDays)
                .absentDays(absentDays)
                .lateDays(lateDays)
                .attendancePercentage(attendancePercentage)
                .build();
    }

    @Override
    public List<Attendance> markClassAttendance(Integer grade, String section, LocalDate date,
            AttendanceStatus defaultStatus, String remarks) {
        List<Student> students = studentRepository.findByGradeAndSection(grade, section);
        if (students.isEmpty()) {
            throw new IllegalArgumentException("No students found in grade " + grade + " section " + section);
        }

        return students.stream().map(student -> {
            // Upsert: if a record already exists for this student/date, return it as-is to avoid duplicates
            Optional<Attendance> existingOpt = attendanceRepository.findByStudent_IdAndDate(student.getId(), date);
            if (existingOpt.isPresent()) {
                return existingOpt.get();
            }

            Attendance attendance = new Attendance();
            attendance.setStudent(student);
            attendance.setDate(date);
            attendance.setStatus(defaultStatus);
            attendance.setRemarks(remarks);
            attendance.setCheckInTime(LocalTime.now());
            return attendanceRepository.save(attendance);
        }).collect(Collectors.toList());
    }

    @Override
    public MonthlyAttendanceReport generateMonthlyReport(Integer grade, String section, Integer year, Integer month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        List<Student> students = studentRepository.findByGradeAndSection(grade, section);
    if (students.isEmpty()) {
        // Gracefully return an empty report instead of throwing
        return MonthlyAttendanceReport.builder()
            .grade(grade)
            .section(section)
            .year(year)
            .month(month)
            .averageAttendancePercentage(0)
            .studentDetails(new ArrayList<>())
            .build();
    }

        List<MonthlyAttendanceReport.StudentAttendanceDetail> studentDetails = new ArrayList<>();
        double totalAttendancePercentage = 0;

        for (Student student : students) {
            List<Attendance> attendances = attendanceRepository.findByStudent_IdAndDateBetween(
                    student.getId(), startDate, endDate);

            int presentDays = (int) attendances.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                    .count();
            int absentDays = (int) attendances.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.ABSENT)
                    .count();
            int lateDays = (int) attendances.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.LATE)
                    .count();

            double attendancePercentage = attendances.isEmpty() ? 0 : (presentDays * 100.0) / attendances.size();

            totalAttendancePercentage += attendancePercentage;

            studentDetails.add(MonthlyAttendanceReport.StudentAttendanceDetail.builder()
                    .studentId(student.getId())
                    .studentName(student.getFirstName() + " " + student.getLastName())
                    .presentDays(presentDays)
                    .absentDays(absentDays)
                    .lateDays(lateDays)
                    .attendancePercentage(attendancePercentage)
                    .build());
        }

        double averageAttendancePercentage = students.isEmpty() ? 0 : totalAttendancePercentage / students.size();

        return MonthlyAttendanceReport.builder()
                .grade(grade)
                .section(section)
                .year(year)
                .month(month)
                .averageAttendancePercentage(averageAttendancePercentage)
                .studentDetails(studentDetails)
                .build();
    }

    @Override
    public MonthlyAttendanceStats generateMonthlyStats(Integer grade, String section, Integer year, Integer month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        List<Student> students = studentRepository.findByGradeAndSection(grade, section);
    if (students.isEmpty()) {
        // Gracefully return empty stats instead of throwing
        return MonthlyAttendanceStats.builder()
            .grade(grade)
            .section(section)
            .year(year)
            .month(month)
            .studentsWith100Percent(new ArrayList<>())
            .studentsBelow75Percent(new ArrayList<>())
            .totalStudents(0)
            .averageAttendance(0)
            .build();
    }

        List<String> studentsWith100Percent = new ArrayList<>();
        List<String> studentsBelow75Percent = new ArrayList<>();
        int totalAttendance = 0;

        for (Student student : students) {
            List<Attendance> attendances = attendanceRepository.findByStudent_IdAndDateBetween(
                    student.getId(), startDate, endDate);

            if (!attendances.isEmpty()) {
                int presentDays = (int) attendances.stream()
                        .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                        .count();

                double attendancePercentage = (presentDays * 100.0) / attendances.size();
                String studentName = student.getFirstName() + " " + student.getLastName();

                if (attendancePercentage == 100.0) {
                    studentsWith100Percent.add(studentName);
                } else if (attendancePercentage < 75.0) {
                    studentsBelow75Percent.add(studentName);
                }

                totalAttendance += attendancePercentage;
            }
        }

        int averageAttendance = students.isEmpty() ? 0 : (int) Math.round(totalAttendance / students.size());

        return MonthlyAttendanceStats.builder()
                .grade(grade)
                .section(section)
                .year(year)
                .month(month)
                .studentsWith100Percent(studentsWith100Percent)
                .studentsBelow75Percent(studentsBelow75Percent)
                .totalStudents(students.size())
                .averageAttendance(averageAttendance)
                .build();
    }

    @Override
    public void deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new AttendanceNotFoundException("Attendance record not found");
        }
        attendanceRepository.deleteById(id);
    }

    @Override
    public int deleteAttendanceOlderThan(LocalDate date) {
        int count = attendanceRepository.countByDateBefore(date);
        attendanceRepository.deleteByDateBefore(date);
        return count;
    }

    @Override
    public List<AttendanceAlert> generateAttendanceAlerts() {
        List<AttendanceAlert> alerts = new ArrayList<>();
        LocalDate today = LocalDate.now();
        List<Student> students = studentRepository.findAll();

        for (Student student : students) {
            int consecutiveAbsences = countConsecutiveAbsences(student.getId(), today);
            double attendancePercentage = calculateAttendancePercentage(student.getId(), today.minusDays(30), today);

            if (consecutiveAbsences >= 3 || attendancePercentage < 75) {
                AttendanceAlert alert = AttendanceAlert.builder()
                        .studentId(student.getId())
                        .studentName(student.getFirstName() + " " + student.getLastName())
                        .grade(student.getGrade())
                        .section(student.getSection())
                        .alertLevel(determineAlertLevel(consecutiveAbsences, attendancePercentage))
                        .message(generateAlertMessage(consecutiveAbsences, attendancePercentage))
                        .attendancePercentage(attendancePercentage)
                        .consecutiveAbsences(consecutiveAbsences)
                        .totalAbsences(countTotalAbsences(student.getId(), today.minusDays(30), today))
                        .build();
                alerts.add(alert);
            }
        }

        return alerts;
    }

    private int countConsecutiveAbsences(Long studentId, LocalDate endDate) {
        int count = 0;
        LocalDate currentDate = endDate;
        while (true) {
            Optional<Attendance> attendance = attendanceRepository.findByStudent_IdAndDate(studentId, currentDate);
            if (attendance.isEmpty() || attendance.get().getStatus() != AttendanceStatus.ABSENT) {
                break;
            }
            count++;
            currentDate = currentDate.minusDays(1);
        }
        return count;
    }

    private double calculateAttendancePercentage(Long studentId, LocalDate startDate, LocalDate endDate) {
    long totalDays = attendanceRepository.countByStudent_IdAndDateBetween(studentId, startDate, endDate);
        if (totalDays == 0)
            return 100.0;

    long presentDays = attendanceRepository.countByStudent_IdAndStatusAndDateBetween(
                studentId, AttendanceStatus.PRESENT, startDate, endDate);

        return (presentDays * 100.0) / totalDays;
    }

    private String determineAlertLevel(int consecutiveAbsences, double attendancePercentage) {
        if (consecutiveAbsences >= 5 || attendancePercentage < 60)
            return "HIGH";
        if (consecutiveAbsences >= 3 || attendancePercentage < 75)
            return "MEDIUM";
        return "LOW";
    }

    private String generateAlertMessage(int consecutiveAbsences, double attendancePercentage) {
        StringBuilder message = new StringBuilder();
        if (consecutiveAbsences > 0) {
            message.append(String.format("Student has been absent for %d consecutive days. ", consecutiveAbsences));
        }
        message.append(String.format("Overall attendance is %.1f%%", attendancePercentage));
        return message.toString();
    }

    private int countTotalAbsences(Long studentId, LocalDate startDate, LocalDate endDate) {
    return (int) attendanceRepository.countByStudent_IdAndStatusAndDateBetween(
                studentId, AttendanceStatus.ABSENT, startDate, endDate);
    }

    @Override
    public double getStudentAttendancePercentage(Long studentId, LocalDate startDate, LocalDate endDate) {
        if (!studentRepository.existsById(studentId)) {
            throw new StudentNotFoundException("Student not found");
        }
        if (startDate.isAfter(endDate)) {
            throw new InvalidDateRangeException("Start date cannot be after end date");
        }
        
        return calculateAttendancePercentage(studentId, startDate, endDate);
    }
}