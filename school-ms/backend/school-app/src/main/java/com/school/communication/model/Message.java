package com.school.communication.model;

import com.school.common.model.BaseEntity;
import com.school.hrm.model.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
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
}