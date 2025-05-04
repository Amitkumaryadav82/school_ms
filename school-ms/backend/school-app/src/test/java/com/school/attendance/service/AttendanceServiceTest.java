package com.school.attendance.service;

import com.school.attendance.model.Attendance;
import com.school.attendance.model.AttendanceStatus;
import com.school.attendance.repository.AttendanceRepository;
import com.school.attendance.dto.AttendanceDTO;
import com.school.attendance.validation.AttendanceValidator;
import com.school.student.model.Student;
import com.school.student.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private StudentService studentService;

    @Mock
    private AttendanceValidator attendanceValidator;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private Student student;
    private Attendance attendance;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        today = LocalDate.now();
        student = Student.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .grade(10)
                .section("A")
                .build();

        attendance = Attendance.builder()
                .id(1L)
                .student(student)
                .date(today)
                .status(AttendanceStatus.PRESENT)
                .build();
    }

    @Test
    void markAttendance_NewAttendance_Success() {
        when(studentService.getStudent(1L)).thenReturn(student);
        when(attendanceRepository.findByStudentIdAndDate(1L, today)).thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(attendance);

        AttendanceDTO dto = AttendanceDTO.builder()
                .studentId(1L)
                .date(today)
                .status(AttendanceStatus.PRESENT)
                .remarks("Present")
                .build();

        attendanceService.markAttendance(dto);

        verify(attendanceRepository).save(any(Attendance.class));
    }

    @Test
    void markAttendance_ExistingAttendance_Success() {
        when(studentService.getStudent(1L)).thenReturn(student);
        when(attendanceRepository.findByStudentIdAndDate(1L, today)).thenReturn(Optional.of(attendance));
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(attendance);

        AttendanceDTO dto = AttendanceDTO.builder()
                .studentId(1L)
                .date(today)
                .status(AttendanceStatus.LATE)
                .remarks("Late")
                .build();

        attendanceService.markAttendance(dto);

        verify(attendanceRepository).save(any(Attendance.class));
    }

    @Test
    void markBulkAttendance_Success() {
        List<Long> studentIds = Arrays.asList(1L, 2L);
        List<AttendanceDTO> dtos = studentIds.stream()
                .map(id -> AttendanceDTO.builder()
                        .studentId(id)
                        .date(today)
                        .status(AttendanceStatus.PRESENT)
                        .remarks("Present")
                        .build())
                .collect(Collectors.toList());

        when(studentService.getStudent(any())).thenReturn(student);
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(attendance);

        attendanceService.markBulkAttendance(dtos);

        verify(attendanceRepository, times(studentIds.size())).save(any(Attendance.class));
    }

    @Test
    void markAttendance_FutureDate_ThrowsException() {
        LocalDate futureDate = today.plusDays(1);
        AttendanceDTO dto = AttendanceDTO.builder()
                .studentId(1L)
                .date(futureDate)
                .status(AttendanceStatus.PRESENT)
                .remarks("Present")
                .build();

        assertThrows(IllegalArgumentException.class, () -> attendanceService.markAttendance(dto));
    }
}