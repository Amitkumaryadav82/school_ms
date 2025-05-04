package com.school.communication.repository;

import com.school.communication.model.Message;
import com.school.communication.model.MessageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderIdOrderBySendTimeDesc(Long senderId);

    List<Message> findByRecipientsContainingOrderBySendTimeDesc(String recipient);

    List<Message> findByMessageTypeAndSendTimeBetweenOrderBySendTimeDesc(
            MessageType type, LocalDateTime start, LocalDateTime end);

    List<Message> findByRecipientsContainingAndReadByNotContaining(String recipient, String reader);
}