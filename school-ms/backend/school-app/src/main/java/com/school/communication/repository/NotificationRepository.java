package com.school.communication.repository;

import com.school.communication.model.InAppNotification;
import com.school.communication.model.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<InAppNotification, Long> {
    List<InAppNotification> findByRecipient(String recipient);

    List<InAppNotification> findByRecipientAndStatus(String recipient, NotificationStatus status);

    List<InAppNotification> findByStatus(NotificationStatus status);

    List<InAppNotification> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<InAppNotification> findByRecipientAndCreatedAtBetween(String recipient, LocalDateTime startDate,
            LocalDateTime endDate);
}