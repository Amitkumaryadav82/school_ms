package com.school.communication.controller;

import com.school.communication.dto.MessageDTO;
import com.school.communication.model.MessageType;
import com.school.communication.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Tag(name = "Communication", description = "APIs for managing school communications")
@SecurityRequirement(name = "bearerAuth")
public class MessageController {
    private final MessageService messageService;

    @Operation(summary = "Send message", description = "Send a new message to recipients")
    @ApiResponse(responseCode = "200", description = "Message sent successfully")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HR_MANAGER', 'STAFF')")
    public ResponseEntity<MessageDTO> sendMessage(@Valid @RequestBody MessageDTO messageDTO) {
        return ResponseEntity.ok(messageService.sendMessage(messageDTO));
    }

    @Operation(summary = "Mark message as read", description = "Mark a message as read by recipient")
    @ApiResponse(responseCode = "200", description = "Message marked as read successfully")
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HR_MANAGER', 'STAFF', 'PARENT')")
    public ResponseEntity<MessageDTO> markAsRead(
            @PathVariable Long id,
            @RequestParam String readerId) {
        return ResponseEntity.ok(messageService.markAsRead(id, readerId));
    }

    @Operation(summary = "Get messages by sender", description = "Retrieve all messages sent by a specific sender")
    @ApiResponse(responseCode = "200", description = "Messages retrieved successfully")
    @GetMapping("/sent/{senderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HR_MANAGER', 'STAFF')")
    public ResponseEntity<List<MessageDTO>> getMessagesBySender(@PathVariable Long senderId) {
        return ResponseEntity.ok(messageService.getMessagesBySender(senderId));
    }

    @Operation(summary = "Get messages by recipient", description = "Retrieve all messages for a specific recipient")
    @ApiResponse(responseCode = "200", description = "Messages retrieved successfully")
    @GetMapping("/received/{recipient}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HR_MANAGER', 'STAFF', 'PARENT')")
    public ResponseEntity<List<MessageDTO>> getMessagesByRecipient(@PathVariable String recipient) {
        return ResponseEntity.ok(messageService.getMessagesByRecipient(recipient));
    }

    @Operation(summary = "Get unread messages", description = "Retrieve all unread messages for a recipient")
    @ApiResponse(responseCode = "200", description = "Unread messages retrieved successfully")
    @GetMapping("/unread/{recipient}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'HR_MANAGER', 'STAFF', 'PARENT')")
    public ResponseEntity<List<MessageDTO>> getUnreadMessages(@PathVariable String recipient) {
        return ResponseEntity.ok(messageService.getUnreadMessages(recipient));
    }

    @Operation(summary = "Get messages by type and date range", description = "Retrieve messages of specific type within a date range")
    @ApiResponse(responseCode = "200", description = "Messages retrieved successfully")
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<List<MessageDTO>> getMessagesByTypeAndDateRange(
            @RequestParam MessageType type,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(messageService.getMessagesByTypeAndDateRange(type, startDate, endDate));
    }
}