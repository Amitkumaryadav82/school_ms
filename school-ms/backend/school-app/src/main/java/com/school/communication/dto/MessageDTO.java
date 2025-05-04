package com.school.communication.dto;

import com.school.communication.model.MessagePriority;
import com.school.communication.model.MessageType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class MessageDTO {
    private Long id;
    private String subject;
    private String content;
    private Long senderId;
    private String senderName;
    private MessageType messageType;
    private MessagePriority priority;
    private LocalDateTime sendTime;
    private Set<String> recipients;
    private Set<String> readBy;
    private boolean isRead;
}