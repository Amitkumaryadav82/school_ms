package com.school.timetable.controller;

import com.school.timetable.model.TimetableSettings;
import com.school.timetable.repository.TimetableSettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/timetable/settings")
public class TimetableSettingsController {

    private final TimetableSettingsRepository repo;

    public TimetableSettingsController(TimetableSettingsRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<TimetableSettings> getSettings() {
        List<TimetableSettings> list = repo.findAll();
        if (list.isEmpty()) {
            TimetableSettings def = new TimetableSettings();
            def.setWorkingDaysMask(31);
            def.setPeriodsPerDay(8);
            def.setPeriodDurationMin(40);
            def.setLunchAfterPeriod(4);
            def.setMaxPeriodsPerTeacherPerDay(5);
            def.setStartTime(LocalTime.of(8, 30));
            def.setEndTime(LocalTime.of(15, 30));
            return ResponseEntity.ok(repo.save(def));
        }
        return ResponseEntity.ok(list.get(0));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN','PRINCIPAL')")
    public ResponseEntity<TimetableSettings> upsert(@RequestBody TimetableSettings incoming) {
        TimetableSettings toSave;
        List<TimetableSettings> list = repo.findAll();
        if (list.isEmpty()) {
            toSave = new TimetableSettings();
        } else {
            toSave = list.get(0);
        }
        toSave.setWorkingDaysMask(incoming.getWorkingDaysMask());
        toSave.setPeriodsPerDay(incoming.getPeriodsPerDay());
        toSave.setPeriodDurationMin(incoming.getPeriodDurationMin());
        toSave.setLunchAfterPeriod(incoming.getLunchAfterPeriod());
        toSave.setMaxPeriodsPerTeacherPerDay(
                incoming.getMaxPeriodsPerTeacherPerDay() != null ? incoming.getMaxPeriodsPerTeacherPerDay() : 5);
        // Fall back to defaults if null
        toSave.setStartTime(incoming.getStartTime() != null ? incoming.getStartTime() : LocalTime.of(8, 30));
        toSave.setEndTime(incoming.getEndTime() != null ? incoming.getEndTime() : LocalTime.of(15, 30));
        return ResponseEntity.ok(repo.save(toSave));
    }
}
