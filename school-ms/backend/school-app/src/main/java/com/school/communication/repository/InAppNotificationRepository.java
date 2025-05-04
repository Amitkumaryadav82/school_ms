package com.school.communication.repository;

import com.school.communication.model.InAppNotification;
import com.school.communication.model.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InAppNotificationRepository extends JpaRepository<InAppNotification, Long> {
    List<InAppNotification> findByRecipientAndStatus(String recipient, NotificationStatus status);

    List<InAppNotification> findByRecipientAndReadAtIsNull(String recipient);
}