package com.school.communication.model;

import com.school.common.model.BaseEntity;
import com.school.hrm.model.Employee;
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
@Builder(toBuilder = true)
public class Message extends BaseEntity {
    
    // Explicit builder method to ensure it's recognized
    public static MessageBuilder builder() {
        return new MessageBuilder();
    }    @Column(nullable = false)
    private String subject;
    
    public String getSubject() {
        return this.subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    public String getContent() {
        return this.content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Employee sender;    @Column(nullable = false)
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
    }

    @Column(nullable = false)
    private LocalDateTime sendTime;    @ElementCollection
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
}
