package com.school.hrm.controller;

import com.school.hrm.dto.SchoolHolidayDTO;
import com.school.hrm.model.HolidayType;
import com.school.hrm.service.SchoolHolidayService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hrm/holidays")
public class SchoolHolidayController {

    private final SchoolHolidayService holidayService;

    @Autowired
    public SchoolHolidayController(SchoolHolidayService holidayService) {
        this.holidayService = holidayService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRINCIPAL')")
    public ResponseEntity<SchoolHolidayDTO> addHoliday(@Valid @RequestBody SchoolHolidayDTO holidayDTO) {
        SchoolHolidayDTO createdHoliday = holidayService.addHoliday(holidayDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdHoliday);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRINCIPAL')")
    public ResponseEntity<SchoolHolidayDTO> updateHoliday(
            @PathVariable Long id,
            @Valid @RequestBody SchoolHolidayDTO holidayDTO) {
        SchoolHolidayDTO updatedHoliday = holidayService.updateHoliday(id, holidayDTO);
        return ResponseEntity.ok(updatedHoliday);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SchoolHolidayDTO> getHolidayById(@PathVariable Long id) {
        SchoolHolidayDTO holiday = holidayService.getHolidayById(id);
        return ResponseEntity.ok(holiday);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<SchoolHolidayDTO> getHolidayByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        SchoolHolidayDTO holiday = holidayService.getHolidayByDate(date);
        return ResponseEntity.ok(holiday);
    }

    @GetMapping
    public ResponseEntity<List<SchoolHolidayDTO>> getAllHolidays() {
        List<SchoolHolidayDTO> holidays = holidayService.getAllHolidays();
        return ResponseEntity.ok(holidays);
    }

    @GetMapping("/range")
    public ResponseEntity<List<SchoolHolidayDTO>> getHolidaysByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<SchoolHolidayDTO> holidays = holidayService.getHolidaysByDateRange(startDate, endDate);
        return ResponseEntity.ok(holidays);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<SchoolHolidayDTO>> getHolidaysByType(@PathVariable String type) {
        List<SchoolHolidayDTO> holidays = holidayService.getHolidaysByType(type);
        return ResponseEntity.ok(holidays);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRINCIPAL')")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Long id) {
        holidayService.deleteHoliday(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/calendar/{year}")
    public ResponseEntity<Map<String, Object>> getHolidaysCalendar(@PathVariable int year) {
        Map<String, Object> calendarData = holidayService.getHolidaysCalendar(year);
        return ResponseEntity.ok(calendarData);
    }

    @PostMapping("/default-holidays/{year}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PRINCIPAL')")
    public ResponseEntity<List<SchoolHolidayDTO>> addDefaultIndianNationalHolidays(@PathVariable int year) {
        List<SchoolHolidayDTO> addedHolidays = holidayService.addDefaultIndianNationalHolidays(year);
        return ResponseEntity.status(HttpStatus.CREATED).body(addedHolidays);
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkIfHoliday(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        boolean isHoliday = holidayService.isHoliday(date);
        Map<String, Object> response = Map.of(
                "date", date,
                "isHoliday", isHoliday);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/holiday-types")
    public ResponseEntity<HolidayType[]> getHolidayTypes() {
        return ResponseEntity.ok(HolidayType.values());
    }
}

