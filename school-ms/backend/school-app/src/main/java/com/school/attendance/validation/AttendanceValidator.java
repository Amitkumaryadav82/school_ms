package com.school.attendance.validation;

import com.school.attendance.model.Attendance;
import com.school.attendance.exception.AttendanceValidationException;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class AttendanceValidator {

    public void validateAttendanceDate(LocalDate date) {
        LocalDate currentDate = LocalDate.now();
        if (date.isAfter(currentDate)) {
            throw new AttendanceValidationException("Attendance date cannot be in the future");
        }

        LocalDate thirtyDaysAgo = currentDate.minusDays(30);
        if (date.isBefore(thirtyDaysAgo)) {
            throw new AttendanceValidationException("Cannot mark/update attendance older than 30 days");
        }
    }

    public void validateCheckOutTime(Attendance attendance) {
        if (attendance.getCheckInTime() == null) {
            throw new AttendanceValidationException("Check-in time must be recorded before check-out");
        }
        if (attendance.getCheckOutTime() != null &&
                attendance.getCheckOutTime().isBefore(attendance.getCheckInTime())) {
            throw new AttendanceValidationException("Check-out time cannot be before check-in time");
        }
    }

    public void validateBulkAttendanceRequest(int studentCount) {
        if (studentCount > 100) {
            throw new AttendanceValidationException("Cannot process more than 100 students at once");
        }
    }
}