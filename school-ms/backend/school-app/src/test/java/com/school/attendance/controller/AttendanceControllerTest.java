package com.school.attendance.controller;

import com.school.attendance.model.Attendance;
import com.school.attendance.model.AttendanceStatus;
import com.school.attendance.service.AttendanceService;
import com.school.attendance.dto.AttendanceDTO;
import com.school.attendance.dto.BulkAttendanceRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceControllerTest {

        @Mock
        private AttendanceService attendanceService;

        @InjectMocks
        private AttendanceController attendanceController;

        private LocalDate today;

        @BeforeEach
        void setUp() {
                today = LocalDate.now();
        }

        @Test
        void markAttendance_Success() {
                Long studentId = 1L;

                doNothing().when(attendanceService).markAttendance(any(AttendanceDTO.class));

                ResponseEntity<Void> response = attendanceController.markAttendance(
                                studentId, AttendanceStatus.PRESENT, today, "Present");

                assertEquals(HttpStatus.OK, response.getStatusCode());
                verify(attendanceService).markAttendance(any(AttendanceDTO.class));
        }

        @Test
        void markBulkAttendance_Success() {
                List<Long> studentIds = Arrays.asList(1L, 2L);
                BulkAttendanceRequest request = new BulkAttendanceRequest();
                request.setStudentIds(studentIds);
                request.setDate(today);
                request.setStatus(AttendanceStatus.PRESENT);
                request.setRemarks("Present");

                doNothing().when(attendanceService).markBulkAttendance(anyList());

                ResponseEntity<List<Attendance>> response = attendanceController.markBulkAttendance(request);

                assertEquals(HttpStatus.OK, response.getStatusCode());
                verify(attendanceService).markBulkAttendance(any());
        }
}