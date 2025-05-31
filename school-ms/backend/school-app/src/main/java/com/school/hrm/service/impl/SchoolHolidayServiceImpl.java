package com.school.hrm.service.impl;

import com.school.hrm.dto.SchoolHolidayDTO;
import com.school.hrm.model.SchoolHoliday;
import com.school.hrm.model.HolidayType;
import com.school.hrm.repository.SchoolHolidayRepository;
import com.school.hrm.service.SchoolHolidayService;
import com.school.hrm.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SchoolHolidayServiceImpl implements SchoolHolidayService {

    private final SchoolHolidayRepository holidayRepository;

    @Autowired
    public SchoolHolidayServiceImpl(SchoolHolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    @Override
    @Transactional
    public SchoolHolidayDTO addHoliday(SchoolHolidayDTO holidayDTO) {
        // Check if holiday already exists on this date
        if (holidayRepository.existsByDate(holidayDTO.getDate())) {
            throw new IllegalArgumentException("A holiday already exists on this date");
        }

        SchoolHoliday holiday = mapToEntity(holidayDTO);
        SchoolHoliday savedHoliday = holidayRepository.save(holiday);
        return mapToDTO(savedHoliday);
    }

    @Override
    @Transactional
    public SchoolHolidayDTO updateHoliday(Long id, SchoolHolidayDTO holidayDTO) {
        SchoolHoliday existingHoliday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday", "id", id));

        // Check if date is being changed and if the new date conflicts with an existing
        // holiday
        if (!existingHoliday.getDate().equals(holidayDTO.getDate()) &&
                holidayRepository.existsByDate(holidayDTO.getDate())) {
            throw new IllegalArgumentException("A holiday already exists on the new date");
        }

        existingHoliday.setDate(holidayDTO.getDate());
        existingHoliday.setName(holidayDTO.getName());
        existingHoliday.setDescription(holidayDTO.getDescription());
        existingHoliday.setType(holidayDTO.getType());

        SchoolHoliday updatedHoliday = holidayRepository.save(existingHoliday);
        return mapToDTO(updatedHoliday);
    }

    @Override
    public SchoolHolidayDTO getHolidayById(Long id) {
        SchoolHoliday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday", "id", id));
        return mapToDTO(holiday);
    }

    @Override
    public SchoolHolidayDTO getHolidayByDate(LocalDate date) {
        SchoolHoliday holiday = holidayRepository.findByDate(date)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday", "date", date));
        return mapToDTO(holiday);
    }

    @Override
    public List<SchoolHolidayDTO> getAllHolidays() {
        List<SchoolHoliday> holidays = holidayRepository.findAll();
        return holidays.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<SchoolHolidayDTO> getHolidaysByDateRange(LocalDate startDate, LocalDate endDate) {
        List<SchoolHoliday> holidays = holidayRepository.findByDateBetween(startDate, endDate);
        return holidays.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<SchoolHolidayDTO> getHolidaysByType(String type) {
        try {
            HolidayType holidayType = HolidayType.valueOf(type.toUpperCase());
            List<SchoolHoliday> holidays = holidayRepository.findByType(holidayType);
            return holidays.stream().map(this::mapToDTO).collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid holiday type: " + type);
        }
    }

    @Override
    @Transactional
    public void deleteHoliday(Long id) {
        if (!holidayRepository.existsById(id)) {
            throw new ResourceNotFoundException("Holiday", "id", id);
        }
        holidayRepository.deleteById(id);
    }

    @Override
    public Map<String, Object> getHolidaysCalendar(int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        List<SchoolHoliday> holidays = holidayRepository.findByDateBetween(startDate, endDate);

        Map<String, Object> result = new HashMap<>();
        result.put("year", year);

        Map<String, List<Map<String, Object>>> monthlyHolidays = new HashMap<>();

        for (int i = 1; i <= 12; i++) {
            monthlyHolidays.put(Month.of(i).toString(), new ArrayList<>());
        }

        holidays.forEach(holiday -> {
            Map<String, Object> holidayMap = new HashMap<>();
            holidayMap.put("id", holiday.getId());
            holidayMap.put("date", holiday.getDate());
            holidayMap.put("name", holiday.getName());
            holidayMap.put("type", holiday.getType());

            String monthKey = holiday.getDate().getMonth().toString();
            monthlyHolidays.get(monthKey).add(holidayMap);
        });

        result.put("holidays", monthlyHolidays);
        return result;
    }

    @Override
    @Transactional
    public List<SchoolHolidayDTO> addDefaultIndianNationalHolidays(int year) {
        List<SchoolHolidayDTO> addedHolidays = new ArrayList<>();

        // List of common Indian holidays
        Map<String, Map<String, Object>> defaultHolidays = new HashMap<>();

        // Republic Day
        defaultHolidays.put("Republic Day", Map.of(
                "date", LocalDate.of(year, 1, 26),
                "type", HolidayType.NATIONAL_HOLIDAY,
                "description", "Celebrates the date on which the Constitution of India came into effect"));

        // Independence Day
        defaultHolidays.put("Independence Day", Map.of(
                "date", LocalDate.of(year, 8, 15),
                "type", HolidayType.NATIONAL_HOLIDAY,
                "description", "Celebrates India's independence from British rule"));

        // Gandhi Jayanti
        defaultHolidays.put("Gandhi Jayanti", Map.of(
                "date", LocalDate.of(year, 10, 2),
                "type", HolidayType.NATIONAL_HOLIDAY,
                "description", "Birthday of Mahatma Gandhi, Father of the Nation"));

        for (Map.Entry<String, Map<String, Object>> entry : defaultHolidays.entrySet()) {
            String name = entry.getKey();
            Map<String, Object> details = entry.getValue();

            LocalDate date = (LocalDate) details.get("date");

            // Skip if a holiday already exists on this date
            if (holidayRepository.existsByDate(date)) {
                continue;
            }

            SchoolHolidayDTO holidayDTO = new SchoolHolidayDTO();
            holidayDTO.setName(name);
            holidayDTO.setDate(date);
            holidayDTO.setType((HolidayType) details.get("type"));
            holidayDTO.setDescription((String) details.get("description"));

            addedHolidays.add(addHoliday(holidayDTO));
        }

        return addedHolidays;
    }

    @Override
    public boolean isHoliday(LocalDate date) {
        return holidayRepository.existsByDate(date);
    }

    // Helper methods to map between entity and DTO
    private SchoolHolidayDTO mapToDTO(SchoolHoliday holiday) {
        return SchoolHolidayDTO.builder()
                .id(holiday.getId())
                .date(holiday.getDate())
                .name(holiday.getName())
                .description(holiday.getDescription())
                .type(holiday.getType())
                .build();
    }

    private SchoolHoliday mapToEntity(SchoolHolidayDTO dto) {
        return SchoolHoliday.builder()
                .date(dto.getDate())
                .name(dto.getName())
                .description(dto.getDescription())
                .type(dto.getType())
                .build();
    }
}
