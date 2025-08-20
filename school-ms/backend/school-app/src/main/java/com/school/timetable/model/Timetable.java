package com.school.timetable.model;

import lombok.Data;
import java.time.LocalDate;

/**
 * Deprecated legacy placeholder. This is no longer a JPA entity and is not persisted.
 */
@Deprecated
@Data
public class Timetable {
    private Long id;

    private String className;
    private String section;
    private String academicYear;
    private LocalDate validFrom;
    private LocalDate validTo;
    private boolean isActive;
}
