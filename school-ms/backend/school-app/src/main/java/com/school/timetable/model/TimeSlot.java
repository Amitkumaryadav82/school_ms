package com.school.timetable.model;

import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Deprecated legacy placeholder. This is no longer a JPA entity and is not persisted.
 */
@Deprecated
@Data
public class TimeSlot {
    private Long id;

    private LocalTime startTime;
    private LocalTime endTime;
    private DayOfWeek dayOfWeek;
    private boolean isBreak;
    private String slotName; // e.g., "First Period", "Lunch Break"
}
