package com.school.admission.dto;

import com.school.admission.model.Admission.AdmissionStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class AdmissionResponse {
    private Long id;
    private String applicantName;
    private LocalDate applicationDate;
    private Integer gradeApplying;
    private AdmissionStatus status;
    private String message;
    private Long studentId; // If admission is approved and student record is created
}