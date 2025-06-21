package com.school.communication.model;

import com.school.common.model.BaseEntity;
import com.school.core.model.Employee;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Table(name = "messages")
@Builder
public class Message extends BaseEntity {
    // The getId() method is inherited from BaseEntity via @Getter
    
    /**
     * Static builder method to create a new MessageBuilder instance
     * @return a new MessageBuilder
     */
    public static MessageBuilder builder() {
        return new MessageBuilder();
    }
    
    /**
     * Explicit getId() method to ensure it's visible to the compiler
     * @return the ID of the message
     */
    public Long getId() {
        return super.getId();
    }
      /**
     * Explicit setId() method to ensure it's visible to the compiler
     * @param id the ID to set
     * @return this instance for method chaining
     */
    public BaseEntity setId(Long id) {
        return super.setId(id);
    }

    @Column(nullable = false)
    private String subject;
    
    public String getSubject() {
        return this.subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    public String getContent() {
        return this.content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }    
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Employee sender;
    
    public Employee getSender() {
        return this.sender;
    }
    
    public void setSender(Employee sender) {
        this.sender = sender;
    }
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MessageType messageType;
    
    public MessageType getMessageType() {
        return this.messageType;
    }
    
    public void setMessageType(MessageType messageType) {
        this.messageType = messageType;
    }

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MessagePriority priority;
    
    public MessagePriority getPriority() {
        return this.priority;
    }
    
    public void setPriority(MessagePriority priority) {
        this.priority = priority;
    }    @Column(nullable = false)
    private LocalDateTime sendTime;
    
    public LocalDateTime getSendTime() {
        return this.sendTime;
    }
    
    public void setSendTime(LocalDateTime sendTime) {
        this.sendTime = sendTime;
    }
    
    @ElementCollection
    @CollectionTable(name = "message_recipients", joinColumns = @JoinColumn(name = "message_id"))
    @Builder.Default
    private Set<String> recipients = new HashSet<>();
    
    public Set<String> getRecipients() {
        return this.recipients;
    }
    
    public void setRecipients(Set<String> recipients) {
        this.recipients = recipients;
    }

    @ElementCollection
    @CollectionTable(name = "message_read_status", joinColumns = @JoinColumn(name = "message_id"))
    @Builder.Default
    private Set<String> readBy = new HashSet<>();
      public Set<String> getReadBy() {
        return this.readBy;
    }
    
    public void setReadBy(Set<String> readBy) {
        this.readBy = readBy;
    }
    
    /**
     * Manual builder implementation for Message
     */
    public static class MessageBuilder {
        private final Message message;
        
        public MessageBuilder() {
            this.message = new Message();
        }
        
        public MessageBuilder id(Long id) {
            message.setId(id);
            return this;
        }
        
        public MessageBuilder subject(String subject) {
            message.setSubject(subject);
            return this;
        }
        
        public MessageBuilder content(String content) {
            message.setContent(content);
            return this;
        }
        
        public MessageBuilder sender(Employee sender) {
            message.setSender(sender);
            return this;
        }
        
        public MessageBuilder messageType(MessageType messageType) {
            message.setMessageType(messageType);
            return this;
        }
        
        public MessageBuilder priority(MessagePriority priority) {
            message.setPriority(priority);
            return this;
        }
        
        public MessageBuilder sendTime(LocalDateTime sendTime) {
            message.setSendTime(sendTime);
            return this;
        }
        
        public MessageBuilder recipients(Set<String> recipients) {
            message.setRecipients(recipients);
            return this;
        }
        
        public MessageBuilder readBy(Set<String> readBy) {
            message.setReadBy(readBy);
            return this;
        }
        
        public Message build() {
            return message;
        }
    }
}
