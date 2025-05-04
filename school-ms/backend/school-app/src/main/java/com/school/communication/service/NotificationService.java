package com.school.communication.service;

import com.school.communication.model.NotificationType;
import java.time.LocalDate;

public interface NotificationService {
    void sendNotification(String to, String subject, String content, NotificationType type);

    void sendAttendanceNotification(String recipient, LocalDate date, String studentName, NotificationType... types);

    boolean isNotificationTypeSupported(NotificationType type);
}