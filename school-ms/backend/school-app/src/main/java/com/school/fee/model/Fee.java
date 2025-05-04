package com.school.fee.model;

import com.school.common.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "fees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fee extends BaseEntity {
    
    @NotBlank
    private String name;
    
    @NotNull
    private Integer grade;
    
    @NotNull
    @Positive
    private Double amount;
    
    @NotNull
    private LocalDate dueDate;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    private FeeType feeType;
    
    private String description;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    private FeeFrequency frequency;
    
    public enum FeeType {
        TUITION, EXAM, LIBRARY, LABORATORY, TRANSPORTATION, OTHER
    }
    
    public enum FeeFrequency {
        ONE_TIME, MONTHLY, QUARTERLY, ANNUALLY
    }
}