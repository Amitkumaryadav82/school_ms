package com.school.fee.model;

import com.school.common.model.BaseEntity;
import com.school.student.model.Student;
import javax.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "fee_payment_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeePaymentSchedule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentFrequency paymentFrequency;

    @Column(nullable = false)
    private LocalDate effectiveFrom;

    private LocalDate effectiveUntil;

    @Column(nullable = false)
    private Integer academicYear;

    @Column(nullable = false)
    private Boolean isActive;

    @Column(nullable = false)
    private Integer frequencyChangeCount;

    private String changeReason;

    public enum PaymentFrequency {
        MONTHLY, QUARTERLY
    }
}
