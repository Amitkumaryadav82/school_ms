package com.school.course.model;

import com.school.common.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "chapters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chapter extends BaseEntity {

    @NotBlank
    @Column(nullable = false)
    private String name;
    
    @NotBlank
    private String subject;
    
    @NotNull
    private Integer grade;
    
    private String description;
    
    @NotNull
    private Integer orderNumber;
    
    @NotNull
    private Double weightage;
    
    @NotNull
    private Integer academicYear;
    
    private Boolean isActive = true;
}
