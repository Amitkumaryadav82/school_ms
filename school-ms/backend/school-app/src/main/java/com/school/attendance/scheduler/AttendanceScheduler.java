package com.school.attendance.scheduler;

import com.school.attendance.service.AttendanceService;
import com.school.attendance.dto.AttendanceAlert;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AttendanceScheduler {

    private final AttendanceService attendanceService;

    @Scheduled(cron = "0 0 1 * * ?") // Run at 1 AM every day
    public void cleanupOldAttendanceRecords() {
        LocalDate cutoffDate = LocalDate.now().minusMonths(6);
        int deletedRecords = attendanceService.deleteAttendanceOlderThan(cutoffDate);
        log.info("Cleaned up {} attendance records older than {}", deletedRecords, cutoffDate);
    }

    @Scheduled(cron = "0 0 8 * * MON-FRI") // Run at 8 AM Monday through Friday
    public void generateDailyAttendanceAlerts() {
        log.info("Starting daily attendance alert generation");
        List<AttendanceAlert> alerts = attendanceService.generateAttendanceAlerts();

        if (!alerts.isEmpty()) {
            log.info("Generated {} attendance alerts", alerts.size());
            alerts.forEach(alert -> {
                log.warn("Attendance Alert - Student: {} (ID: {}), Grade: {}, Section: {}, Level: {}",
                        alert.getStudentName(),
                        alert.getStudentId(),
                        alert.getGrade(),
                        alert.getSection(),
                        alert.getAlertLevel());
                log.warn("Alert Details: {}", alert.getMessage());
            });
        } else {
            log.info("No attendance alerts generated for today");
        }
    }
}