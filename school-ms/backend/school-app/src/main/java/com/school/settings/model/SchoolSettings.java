package com.school.settings.model;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "school_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolSettings {
    @Id
    private Long id; // singleton row with id=1

    private String schoolName;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String phone;
    private String email;
    private String logoUrl;
    private String receiptPrefix; // e.g., R or RCPT-

    private LocalDateTime updatedAt;
}
