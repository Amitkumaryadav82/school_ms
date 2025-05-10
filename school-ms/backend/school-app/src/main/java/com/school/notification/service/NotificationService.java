package com.school.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:school-noreply@example.com}")
    private String fromEmail;

    @Value("${notification.email.enabled:false}")
    private boolean emailEnabled;

    private final Map<String, Integer> notificationCounts = new HashMap<>();

    /**
     * Send email notification asynchronously
     */
    @Async
    public void sendEmail(String to, String subject, String body) {
        if (!emailEnabled) {
            logger.info("Email notifications are disabled. Would have sent: To={}, Subject={}", to, subject);
            logNotification(to, subject);
            return;
        }

        try {
            if (mailSender == null) {
                logger.warn("JavaMailSender not configured. Email not sent: To={}, Subject={}", to, subject);
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            logNotification(to, subject);

            logger.info("Email notification sent successfully: To={}, Subject={}", to, subject);
        } catch (Exception e) {
            logger.error("Failed to send email notification: To={}, Subject={}", to, subject, e);
        }
    }

    /**
     * Send bulk email notifications
     */
    @Async
    public void sendBulkEmail(String[] recipients, String subject, String body) {
        for (String recipient : recipients) {
            sendEmail(recipient, subject, body);
        }
    }

    /**
     * Track notification count for reporting/monitoring
     */
    private void logNotification(String recipient, String subject) {
        String key = LocalDateTime.now().toLocalDate() + ":" + subject;
        notificationCounts.put(key, notificationCounts.getOrDefault(key, 0) + 1);
    }

    /**
     * Get notification statistics
     */
    public Map<String, Integer> getNotificationStats() {
        return new HashMap<>(notificationCounts);
    }
}