package com.school.attendance.integration;

import com.school.attendance.model.Attendance;
import com.school.attendance.model.AttendanceStatus;
import com.school.attendance.service.AttendanceService;
import com.school.attendance.dto.AttendanceDTO;
import com.school.attendance.dto.MonthlyAttendanceReport;
import com.school.attendance.dto.MonthlyAttendanceStats;
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

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AttendanceIntegrationTest {

        @Autowired
        private AttendanceService attendanceService;

        @Autowired
        private StudentService studentService;

        private Student student1;
        private Student student2;
        private LocalDate today;

        @BeforeEach
        void setUp() {
                today = LocalDate.now();
                student1 = createTestStudent("John", "Doe");
                student2 = createTestStudent("Jane", "Smith");
        }

        @Test
        void markAttendance_Success() {
                AttendanceDTO dto = AttendanceDTO.builder()
                                .studentId(student1.getId())
                                .date(today)
                                .status(AttendanceStatus.PRESENT)
                                .remarks("Present")
                                .build();

                attendanceService.markAttendance(dto);

                List<Attendance> attendanceList = attendanceService.getStudentAttendance(student1.getId());
                assertFalse(attendanceList.isEmpty());
                assertEquals(AttendanceStatus.PRESENT, attendanceList.get(0).getStatus());
        }

        @Test
        void markBulkAttendance_Success() {
                List<AttendanceDTO> dtos = Arrays.asList(
                                AttendanceDTO.builder()
                                                .studentId(student1.getId())
                                                .date(today)
                                                .status(AttendanceStatus.PRESENT)
                                                .remarks("Present")
                                                .build(),
                                AttendanceDTO.builder()
                                                .studentId(student2.getId())
                                                .date(today)
                                                .status(AttendanceStatus.PRESENT)
                                                .remarks("Present")
                                                .build());

                attendanceService.markBulkAttendance(dtos);

                List<Attendance> student1Attendance = attendanceService.getStudentAttendance(student1.getId());
                List<Attendance> student2Attendance = attendanceService.getStudentAttendance(student2.getId());

                assertFalse(student1Attendance.isEmpty());
                assertFalse(student2Attendance.isEmpty());
        }

        @Test
        void generateMonthlyReport_Success() {
                markMonthAttendance();

                MonthlyAttendanceReport report = attendanceService.generateMonthlyReport(10, "A",
                                today.getYear(), today.getMonthValue());

                assertNotNull(report);
                assertTrue(report.getAverageAttendancePercentage() > 0);
        }

        @Test
        void generateMonthlyStats_Success() {
                markMonthAttendance();

                MonthlyAttendanceStats stats = attendanceService.generateMonthlyStats(10, "A",
                                today.getYear(), today.getMonthValue());

                assertNotNull(stats);
                assertFalse(stats.getStudentsWith100Percent().isEmpty());
                assertFalse(stats.getStudentsBelow75Percent().isEmpty());
        }

        @Test
        void getStudentAttendanceSummary_Success() {
                AttendanceDTO dto = AttendanceDTO.builder()
                                .studentId(student1.getId())
                                .date(today)
                                .status(AttendanceStatus.PRESENT)
                                .remarks("Present")
                                .build();

                attendanceService.markAttendance(dto);

                var summary = attendanceService.getStudentAttendanceSummary(
                                student1.getId(), today.minusDays(30), today);

                assertNotNull(summary);
                assertTrue(summary.getTotalDays() > 0);
        }

        private void markMonthAttendance() {
                // Mark attendance for the whole month
                for (int i = 0; i < 30; i++) {
                        AttendanceDTO dto1 = AttendanceDTO.builder()
                                        .studentId(student1.getId())
                                        .date(today.minusDays(i))
                                        .status(AttendanceStatus.PRESENT)
                                        .remarks("Present")
                                        .build();
                        AttendanceDTO dto2 = AttendanceDTO.builder()
                                        .studentId(student2.getId())
                                        .date(today.minusDays(i))
                                        .status(i < 20 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT)
                                        .remarks(i < 20 ? "Present" : "Absent")
                                        .build();

                        attendanceService.markAttendance(dto1);
                        attendanceService.markAttendance(dto2);
                }
        }

        private Student createTestStudent(String firstName, String lastName) {
                Student student = Student.builder()
                                .firstName(firstName)
                                .lastName(lastName)
                                .grade(10)
                                .section("A")
                                .build();
                return studentService.createStudent(student);
        }
}