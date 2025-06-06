package com.school.fee.model;

import com.school.common.model.Auditable;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fee_structures")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class FeeStructure extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_grade", nullable = false, unique = true)
    private Integer classGrade;

    @Column(name = "annual_fees", nullable = false)
    private BigDecimal annualFees;

    @Column(name = "building_fees", nullable = false)
    private BigDecimal buildingFees;

    @Column(name = "lab_fees", nullable = false)
    private BigDecimal labFees;

    @OneToMany(mappedBy = "feeStructure", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentSchedule> paymentSchedules = new ArrayList<>();

    @OneToMany(mappedBy = "feeStructure", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LateFee> lateFees = new ArrayList<>();

    public BigDecimal getTotalFees() {
        return annualFees.add(buildingFees).add(labFees);
    }
}
