package com.school.hrm.model;

import com.school.common.model.Auditable;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDate;

@Entity
@Table(name = "school_holidays")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Holiday extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "date")
    private LocalDate date;

    @NotNull
    @Size(min = 2, max = 100)
    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private HolidayType type;

    public enum HolidayType {
        NATIONAL_HOLIDAY,
        RELIGIOUS_HOLIDAY,
        SCHOOL_FUNCTION,
        OTHER
    }
}
