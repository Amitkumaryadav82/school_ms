package com.school.timetable.repository;

import com.school.timetable.model.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {
    List<TimetableSlot> findByClassIdAndSectionIdOrderByDayOfWeekAscPeriodNoAsc(Long classId, Long sectionId);

    void deleteByClassIdAndSectionId(Long classId, Long sectionId);

    java.util.Optional<TimetableSlot> findByClassIdAndSectionIdAndDayOfWeekAndPeriodNo(Long classId, Long sectionId,
            Integer dayOfWeek, Integer periodNo);
}
