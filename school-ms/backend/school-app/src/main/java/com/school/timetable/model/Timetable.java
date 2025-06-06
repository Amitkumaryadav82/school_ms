package com.school.timetable.model;

import javax.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import com.school.common.model.BaseEntity;
import java.time.LocalDate;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class Timetable extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String className;
    private String section;
    private String academicYear;
    private LocalDate validFrom;
    private LocalDate validTo;
    private boolean isActive;
}
