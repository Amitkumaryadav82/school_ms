package com.school.communication.dto;

import com.school.communication.model.MessagePriority;
import com.school.communication.model.MessageType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

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
    
    // Explicit getters and setters in case Lombok fails
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    
    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }
    
    public MessagePriority getPriority() { return priority; }
    public void setPriority(MessagePriority priority) { this.priority = priority; }
    
    public LocalDateTime getSendTime() { return sendTime; }
    public void setSendTime(LocalDateTime sendTime) { this.sendTime = sendTime; }
    
    public Set<String> getRecipients() { return recipients; }
    public void setRecipients(Set<String> recipients) { this.recipients = recipients; }
    
    public Set<String> getReadBy() { return readBy; }
    public void setReadBy(Set<String> readBy) { this.readBy = readBy; }
    
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    
    // Static builder method in case Lombok builder isn't working
    public static MessageDTOBuilder builder() {
        return new MessageDTOBuilder();
    }
    
    // Manual builder implementation
    public static class MessageDTOBuilder {
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
        
        public MessageDTOBuilder id(Long id) { this.id = id; return this; }
        public MessageDTOBuilder subject(String subject) { this.subject = subject; return this; }
        public MessageDTOBuilder content(String content) { this.content = content; return this; }
        public MessageDTOBuilder senderId(Long senderId) { this.senderId = senderId; return this; }
        public MessageDTOBuilder senderName(String senderName) { this.senderName = senderName; return this; }
        public MessageDTOBuilder messageType(MessageType messageType) { this.messageType = messageType; return this; }
        public MessageDTOBuilder priority(MessagePriority priority) { this.priority = priority; return this; }
        public MessageDTOBuilder sendTime(LocalDateTime sendTime) { this.sendTime = sendTime; return this; }
        public MessageDTOBuilder recipients(Set<String> recipients) { this.recipients = recipients; return this; }
        public MessageDTOBuilder readBy(Set<String> readBy) { this.readBy = readBy; return this; }
        public MessageDTOBuilder read(boolean isRead) { this.isRead = isRead; return this; }
        
        public MessageDTO build() {
            MessageDTO dto = new MessageDTO();
            dto.id = this.id;
            dto.subject = this.subject;
            dto.content = this.content;
            dto.senderId = this.senderId;
            dto.senderName = this.senderName;
            dto.messageType = this.messageType;
            dto.priority = this.priority;
            dto.sendTime = this.sendTime;
            dto.recipients = this.recipients;
            dto.readBy = this.readBy;
            dto.isRead = this.isRead;
            return dto;
        }
    }
}