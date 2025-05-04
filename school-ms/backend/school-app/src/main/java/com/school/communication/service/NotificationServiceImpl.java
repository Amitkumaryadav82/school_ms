package com.school.communication.service;

import com.school.communication.model.NotificationType;
import com.school.communication.model.NotificationStatus;
import com.school.communication.model.InAppNotification;
import com.school.communication.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public void sendNotification(String recipient, String subject, String content, NotificationType type) {
        switch (type) {
            case EMAIL:
                sendEmailNotification(recipient, subject, content);
                break;
            case IN_APP:
                sendInAppNotification(recipient, subject, content);
                break;
            case SMS:
                // TODO: Implement SMS notification
                break;
            case PUSH_NOTIFICATION:
                // TODO: Implement push notification
                break;
        }
    }

    @Override
    public void sendAttendanceNotification(String recipient, LocalDate date, String studentName,
            NotificationType... types) {
        String subject = "Attendance Alert - " + studentName;
        String content = String.format("Student %s was marked absent on %s", studentName,
                date.format(DateTimeFormatter.ISO_LOCAL_DATE));

        for (NotificationType type : types) {
            if (isNotificationTypeSupported(type)) {
                sendNotification(recipient, subject, content, type);
            }
        }
    }

    @Override
    public boolean isNotificationTypeSupported(NotificationType type) {
        return type == NotificationType.EMAIL || type == NotificationType.IN_APP;
    }

    private void sendEmailNotification(String recipient, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }

    private void sendInAppNotification(String recipient, String subject, String content) {
        InAppNotification notification = new InAppNotification();
        notification.setRecipient(recipient);
        notification.setSubject(subject);
        notification.setContent(content);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }
}