package com.school.fee.model;

import com.school.common.model.BaseEntity;
import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
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
