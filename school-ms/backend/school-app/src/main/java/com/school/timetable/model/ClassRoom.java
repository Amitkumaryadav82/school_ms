package com.school.timetable.model;

import lombok.Data;

/**
 * Deprecated legacy placeholder. This is no longer a JPA entity and is not persisted.
 * Keeping the class temporarily to avoid breaking references while the module evolves.
 */
@Deprecated
@Data
public class ClassRoom {
    private Long id;

    private String roomNumber;
    private String building;
    private int capacity;
    private String roomType; // CLASSROOM, LAB, LIBRARY etc.
    private boolean isActive;
}
