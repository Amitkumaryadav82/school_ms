package com.school.attendance;

import com.school.attendance.model.Attendance;
import com.school.attendance.model.AttendanceStatus;
import com.school.attendance.service.AttendanceService;
import com.school.attendance.dto.AttendanceDTO;
import com.school.student.model.Student;
import com.school.student.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AttendanceIntegrationTest {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private StudentService studentService;

    private Student student;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        today = LocalDate.now();
        student = createTestStudent();
    }

    @Test
    void markAttendance_Success() {
        AttendanceDTO dto = AttendanceDTO.builder()
                .studentId(student.getId())
                .date(today)
                .status(AttendanceStatus.PRESENT)
                .remarks("Present")
                .build();

        attendanceService.markAttendance(dto);
        // Verify through repository or service methods
    }

    @Test
    void getAttendance_Success() {
        AttendanceDTO dto = AttendanceDTO.builder()
                .studentId(student.getId())
                .date(today)
                .status(AttendanceStatus.PRESENT)
                .remarks("Present")
                .build();

        attendanceService.markAttendance(dto);
        List<Attendance> attendanceList = attendanceService.getStudentAttendance(student.getId());

        assertFalse(attendanceList.isEmpty());
    }

    @Test
    void deleteAttendance_Success() {
        AttendanceDTO dto = AttendanceDTO.builder()
                .studentId(student.getId())
                .date(today)
                .status(AttendanceStatus.PRESENT)
                .remarks("Present")
                .build();

        attendanceService.markAttendance(dto);
        // Test deletion logic
    }

    private Student createTestStudent() {
        Student student = Student.builder()
                .firstName("John")
                .lastName("Doe")
                .grade(10)
                .section("A")
                .build();
        return studentService.createStudent(student);
    }
}