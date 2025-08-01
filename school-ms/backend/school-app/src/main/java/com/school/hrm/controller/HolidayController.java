package com.school.hrm.controller;

import com.school.hrm.dto.HolidayDTO;
import com.school.hrm.model.Holiday.HolidayType;
import com.school.hrm.service.HolidayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hrm/holidays")
public class HolidayController {

    private final HolidayService holidayService;

    @Autowired
    public HolidayController(HolidayService holidayService) {
        this.holidayService = holidayService;
    }

    @PostMapping
    public ResponseEntity<HolidayDTO> createHoliday(@Valid @RequestBody HolidayDTO holidayDTO) {
        HolidayDTO createdHoliday = holidayService.createHoliday(holidayDTO);
        return new ResponseEntity<>(createdHoliday, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HolidayDTO> updateHoliday(
            @PathVariable Long id,
            @Valid @RequestBody HolidayDTO holidayDTO) {
        HolidayDTO updatedHoliday = holidayService.updateHoliday(id, holidayDTO);
        return ResponseEntity.ok(updatedHoliday);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Long id) {
        holidayService.deleteHoliday(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<HolidayDTO> getHolidayById(@PathVariable Long id) {
        HolidayDTO holiday = holidayService.getHolidayById(id);
        return ResponseEntity.ok(holiday);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<HolidayDTO> getHolidayByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        HolidayDTO holiday = holidayService.getHolidayByDate(date);
        return ResponseEntity.ok(holiday);
    }

    @GetMapping
    public ResponseEntity<List<HolidayDTO>> getAllHolidays() {
        List<HolidayDTO> holidays = holidayService.getAllHolidays();
        return ResponseEntity.ok(holidays);
    }

    @GetMapping("/range")
    public ResponseEntity<List<HolidayDTO>> getHolidaysByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<HolidayDTO> holidays = holidayService.getHolidaysByDateRange(startDate, endDate);
        return ResponseEntity.ok(holidays);
    }

    @GetMapping("/calendar/{year}")
    public ResponseEntity<Map<String, Object>> getHolidaysByYear(@PathVariable int year) {
        List<HolidayDTO> holidays = holidayService.getHolidaysByYear(year);

        // Sort holidays by date (month and day)
        holidays.sort(Comparator.comparing(HolidayDTO::getDate));

        // Group holidays by month
        Map<String, List<HolidayDTO>> holidaysByMonth = holidays.stream()
                .collect(Collectors.groupingBy(holiday -> {
                    Month month = holiday.getDate().getMonth();
                    return month.getDisplayName(TextStyle.FULL, Locale.ENGLISH);
                }));

        Map<String, Object> response = new HashMap<>();
        response.put("holidays", holidaysByMonth);
        response.put("allHolidays", holidays); // Add sorted flat list for tabular view

        return ResponseEntity.ok(response);
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkIfHoliday(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Map<String, Boolean> response = holidayService.checkIfHoliday(date);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/holiday-types")
    public ResponseEntity<List<HolidayType>> getHolidayTypes() {
        List<HolidayType> holidayTypes = holidayService.getHolidayTypes();
        return ResponseEntity.ok(holidayTypes);
    }

    @PostMapping("/default-holidays/{year}")
    public ResponseEntity<List<HolidayDTO>> addDefaultHolidays(@PathVariable int year) {
        List<HolidayDTO> defaultHolidays = holidayService.addDefaultHolidays(year);
        return new ResponseEntity<>(defaultHolidays, HttpStatus.CREATED);
    }
}
