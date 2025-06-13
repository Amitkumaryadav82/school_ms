package com.school.communication.model;

import com.school.common.model.BaseEntity;
import com.school.hrm.model.Employee;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Table(name = "messages")
public class Message extends BaseEntity {
    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Employee sender;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MessageType messageType;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MessagePriority priority;

    @Column(nullable = false)
    private LocalDateTime sendTime;

    @ElementCollection
    @CollectionTable(name = "message_recipients", joinColumns = @JoinColumn(name = "message_id"))
    @Builder.Default
    private Set<String> recipients = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "message_read_status", joinColumns = @JoinColumn(name = "message_id"))
    @Builder.Default
    private Set<String> readBy = new HashSet<>();

    // Explicit getters and setters in case Lombok fails
    public String getSubject() { return subject; }
    public String getContent() { return content; }
    public Employee getSender() { return sender; }
    public MessageType getMessageType() { return messageType; }
    public MessagePriority getPriority() { return priority; }
    public LocalDateTime getSendTime() { return sendTime; }
    public Set<String> getRecipients() { return recipients; }
    public Set<String> getReadBy() { return readBy; }

    public void setSubject(String subject) { this.subject = subject; }
    public void setContent(String content) { this.content = content; }
    public void setSender(Employee sender) { this.sender = sender; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }
    public void setPriority(MessagePriority priority) { this.priority = priority; }
    public void setSendTime(LocalDateTime sendTime) { this.sendTime = sendTime; }
    public void setRecipients(Set<String> recipients) { this.recipients = recipients; }
    public void setReadBy(Set<String> readBy) { this.readBy = readBy; }

    // Static builder method in case Lombok builder isn't working
    public static MessageBuilder builder() {
        return new MessageBuilder();
    }

    // Manual builder implementation
    public static class MessageBuilder {
        private String subject;
        private String content;
        private Employee sender;
        private MessageType messageType;
        private MessagePriority priority;
        private LocalDateTime sendTime;
        private Set<String> recipients = new HashSet<>();
        private Set<String> readBy = new HashSet<>();

        public MessageBuilder subject(String subject) { this.subject = subject; return this; }
        public MessageBuilder content(String content) { this.content = content; return this; }
        public MessageBuilder sender(Employee sender) { this.sender = sender; return this; }
        public MessageBuilder messageType(MessageType messageType) { this.messageType = messageType; return this; }
        public MessageBuilder priority(MessagePriority priority) { this.priority = priority; return this; }
        public MessageBuilder sendTime(LocalDateTime sendTime) { this.sendTime = sendTime; return this; }
        public MessageBuilder recipients(Set<String> recipients) { this.recipients = recipients; return this; }
        public MessageBuilder readBy(Set<String> readBy) { this.readBy = readBy; return this; }

        public Message build() {
            Message message = new Message();
            message.subject = this.subject;
            message.content = this.content;
            message.sender = this.sender;
            message.messageType = this.messageType;
            message.priority = this.priority;
            message.sendTime = this.sendTime;
            message.recipients = this.recipients;
            message.readBy = this.readBy;
            return message;
        }
    }
}
