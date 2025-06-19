package com.school.communication.service;

import com.school.communication.model.Message;
import com.school.communication.model.MessageType;
import com.school.communication.model.NotificationType;
import com.school.communication.repository.MessageRepository;
import com.school.communication.dto.MessageDTO;
import com.school.core.model.Employee;
import com.school.core.repository.EmployeeRepository;
import com.school.communication.exception.MessageNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public MessageDTO sendMessage(MessageDTO messageDTO) {
        Employee sender = employeeRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        Message message = Message.builder()
                .subject(messageDTO.getSubject())
                .content(messageDTO.getContent())
                .sender(sender)
                .messageType(messageDTO.getMessageType())
                .priority(messageDTO.getPriority())
                .sendTime(LocalDateTime.now())
                .recipients(messageDTO.getRecipients())
                .readBy(messageDTO.getReadBy())
                .build();        Message savedMessage = messageRepository.save(message);
        MessageDTO savedMessageDTO = convertToDTO(savedMessage);
        
        // Send notifications based on message type
        switch (messageDTO.getMessageType()) {
            case EMERGENCY_ALERT:
                // For emergency alerts, send all types of notifications
                for (String recipient : messageDTO.getRecipients()) {
                    notificationService.sendNotification(recipient, message.getSubject(), message.getContent(),
                            NotificationType.EMAIL);
                    notificationService.sendNotification(recipient, message.getSubject(), message.getContent(),
                            NotificationType.SMS);
                    notificationService.sendNotification(recipient, message.getSubject(), message.getContent(),
                            NotificationType.PUSH_NOTIFICATION);
                }
                break;
            case ANNOUNCEMENT:
            case STAFF_NOTICE:
                // For announcements and staff notices, send email and in-app notifications
                for (String recipient : messageDTO.getRecipients()) {
                    notificationService.sendNotification(recipient, message.getSubject(), message.getContent(),
                            NotificationType.EMAIL);
                    notificationService.sendNotification(recipient, message.getSubject(), message.getContent(),
                            NotificationType.IN_APP);
                }
                break;
            default:
                // For other types, send only in-app notifications
                for (String recipient : messageDTO.getRecipients()) {
                    notificationService.sendNotification(recipient, message.getSubject(), message.getContent(),
                            NotificationType.IN_APP);
                }
        }

        return savedMessageDTO;
    }

    public MessageDTO markAsRead(Long messageId, String readerId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageNotFoundException(messageId));

        if (message.getRecipients().contains(readerId) && !message.getReadBy().contains(readerId)) {
            message.getReadBy().add(readerId);
            Message updatedMessage = messageRepository.save(message);
            return convertToDTO(updatedMessage);
        }

        return convertToDTO(message);
    }

    public List<MessageDTO> getMessagesBySender(Long senderId) {
        return messageRepository.findBySenderIdOrderBySendTimeDesc(senderId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<MessageDTO> getMessagesByRecipient(String recipient) {
        return messageRepository.findByRecipientsContainingOrderBySendTimeDesc(recipient).stream()
                .map(message -> {
                    MessageDTO dto = convertToDTO(message);
                    dto.setRead(message.getReadBy().contains(recipient));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<MessageDTO> getUnreadMessages(String recipient) {
        return messageRepository.findByRecipientsContainingAndReadByNotContaining(recipient, recipient).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<MessageDTO> getMessagesByTypeAndDateRange(MessageType type, LocalDateTime start, LocalDateTime end) {
        return messageRepository.findByMessageTypeAndSendTimeBetweenOrderBySendTimeDesc(type, start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private MessageDTO convertToDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .subject(message.getSubject())
                .content(message.getContent())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFirstName() + " " + message.getSender().getLastName())
                .messageType(message.getMessageType())
                .priority(message.getPriority())
                .sendTime(message.getSendTime())
                .recipients(message.getRecipients())
                .readBy(message.getReadBy())
                .build();
    }
}