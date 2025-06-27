package com.school.hrm.controller;

import com.school.hrm.dto.HolidayDTO;
import com.school.hrm.model.Holiday;
import com.school.hrm.model.Holiday.HolidayType;
import com.school.hrm.service.HolidayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.Map;

/**
 * Controller for debugging and testing holiday functionality
 */
@RestController
@RequestMapping("/api/debug/holidays")
public class HolidayDebugController {

    private final HolidayService holidayService;

    @Autowired
    public HolidayDebugController(HolidayService holidayService) {
        this.holidayService = holidayService;
    }

    @PostMapping("/create-test-holiday")
    public ResponseEntity<HolidayDTO> createTestHoliday() {
        // Create a holiday for today
        HolidayDTO holidayDTO = new HolidayDTO();
        LocalDate today = LocalDate.now();
        holidayDTO.setDate(today);
        holidayDTO.setName("Test Holiday " + today);
        holidayDTO.setDescription("This is a test holiday created for debugging");
        holidayDTO.setType(HolidayType.OTHER);

        HolidayDTO createdHoliday = holidayService.createHoliday(holidayDTO);
        
        return new ResponseEntity<>(createdHoliday, HttpStatus.CREATED);
    }

    @GetMapping("/check-date")
    public ResponseEntity<Map<String, Boolean>> checkIfHoliday(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        if (date == null) {
            date = LocalDate.now();
        }
        
        Map<String, Boolean> result = holidayService.checkIfHoliday(date);
        return ResponseEntity.ok(result);
    }
}
