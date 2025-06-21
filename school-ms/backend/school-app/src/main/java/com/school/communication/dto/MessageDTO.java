package com.school.communication.dto;

import com.school.communication.model.MessagePriority;
import com.school.communication.model.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
public class MessageDTO {
    
    // Constructor that matches the parameters used in the builder's build() method
    public MessageDTO(Long id, String subject, String content, Long senderId, String senderName,
                     MessageType messageType, MessagePriority priority, LocalDateTime sendTime,
                     Set<String> recipients, Set<String> readBy, boolean isRead) {
        this.id = id;
        this.subject = subject;
        this.content = content;
        this.senderId = senderId;
        this.senderName = senderName;
        this.messageType = messageType;
        this.priority = priority;
        this.sendTime = sendTime;
        this.recipients = recipients;
        this.readBy = readBy;
        this.isRead = isRead;
    }
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
    
    // Manual builder pattern since we're not using Lombok @Builder
    public static MessageDTOBuilder builder() {
        return new MessageDTOBuilder();
    }
    
    public Long getId() {
        return this.id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getSenderId() {
        return this.senderId;
    }
    
    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }
    
    public String getSenderName() {
        return this.senderName;
    }
    
    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }
    
    public String getSubject() {
        return this.subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getContent() {
        return this.content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public MessageType getMessageType() {
        return this.messageType;
    }
    
    public void setMessageType(MessageType messageType) {
        this.messageType = messageType;
    }
    
    public MessagePriority getPriority() {
        return this.priority;
    }
    
    public void setPriority(MessagePriority priority) {
        this.priority = priority;
    }
    
    public LocalDateTime getSendTime() {
        return this.sendTime;
    }
    
    public void setSendTime(LocalDateTime sendTime) {
        this.sendTime = sendTime;
    }
    
    public Set<String> getRecipients() {
        return this.recipients;
    }
    
    public void setRecipients(Set<String> recipients) {
        this.recipients = recipients;
    }
    
    public Set<String> getReadBy() {
        return this.readBy;
    }
    
    public void setReadBy(Set<String> readBy) {
        this.readBy = readBy;
    }
    
    public boolean isRead() {
        return this.isRead;
    }
    
    public void setRead(boolean isRead) {
        this.isRead = isRead;
    }
    
    // Builder class for MessageDTO
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
        
        public MessageDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }
        
        public MessageDTOBuilder subject(String subject) {
            this.subject = subject;
            return this;
        }
        
        public MessageDTOBuilder content(String content) {
            this.content = content;
            return this;
        }
        
        public MessageDTOBuilder senderId(Long senderId) {
            this.senderId = senderId;
            return this;
        }
        
        public MessageDTOBuilder senderName(String senderName) {
            this.senderName = senderName;
            return this;
        }
        
        public MessageDTOBuilder messageType(MessageType messageType) {
            this.messageType = messageType;
            return this;
        }
        
        public MessageDTOBuilder priority(MessagePriority priority) {
            this.priority = priority;
            return this;
        }
        
        public MessageDTOBuilder sendTime(LocalDateTime sendTime) {
            this.sendTime = sendTime;
            return this;
        }
        
        public MessageDTOBuilder recipients(Set<String> recipients) {
            this.recipients = recipients;
            return this;
        }
        
        public MessageDTOBuilder readBy(Set<String> readBy) {
            this.readBy = readBy;
            return this;
        }
        
        public MessageDTOBuilder isRead(boolean isRead) {
            this.isRead = isRead;
            return this;
        }
        
        public MessageDTO build() {
            return new MessageDTO(id, subject, content, senderId, senderName, messageType, 
                    priority, sendTime, recipients, readBy, isRead);
        }
    }
}