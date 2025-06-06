package com.school.timetable.model;

import javax.persistence.*;
import lombok.Data;

@Entity
@Data
public class ClassRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomNumber;
    private String building;
    private int capacity;
    private String roomType; // CLASSROOM, LAB, LIBRARY etc.
    private boolean isActive;
}
