package com.school.hrm.service.impl;

import com.school.exception.ResourceNotFoundException;
import com.school.hrm.dto.HolidayDTO;
import com.school.hrm.model.Holiday;
import com.school.hrm.model.Holiday.HolidayType;
import com.school.hrm.repository.HolidayRepository;
import com.school.hrm.service.HolidayService;
import com.school.hrm.util.HolidayThreadLocal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class HolidayServiceImpl implements HolidayService {

    private static final Logger log = LoggerFactory.getLogger(HolidayServiceImpl.class);

    private final HolidayRepository holidayRepository;

    public HolidayServiceImpl(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    @Override
    @Transactional
    public HolidayDTO createHoliday(HolidayDTO holidayDTO) {
        Holiday holiday = convertToEntity(holidayDTO);
        Holiday savedHoliday = holidayRepository.save(holiday);
        return convertToDTO(savedHoliday);
    }

    @Override
    @Transactional
    public HolidayDTO updateHoliday(Long id, HolidayDTO holidayDTO) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with id: " + id));
        
        holiday.setDate(holidayDTO.getDate());
        holiday.setName(holidayDTO.getName());
        holiday.setDescription(holidayDTO.getDescription());
        holiday.setType(holidayDTO.getType());
        
        Holiday updatedHoliday = holidayRepository.save(holiday);
        return convertToDTO(updatedHoliday);
    }

    @Override
    @Transactional
    public void deleteHoliday(Long id) {
        if (!holidayRepository.existsById(id)) {
            throw new ResourceNotFoundException("Holiday not found with id: " + id);
        }
        holidayRepository.deleteById(id);
    }

    @Override
    public HolidayDTO getHolidayById(Long id) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with id: " + id));
        return convertToDTO(holiday);
    }

    @Override
    public HolidayDTO getHolidayByDate(LocalDate date) {
        Holiday holiday = holidayRepository.findByDate(date)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found for date: " + date));
        return convertToDTO(holiday);
    }

    @Override
    public List<HolidayDTO> getAllHolidays() {
        List<Holiday> holidays = holidayRepository.findAll();
        return holidays.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HolidayDTO> getHolidaysByDateRange(LocalDate startDate, LocalDate endDate) {
        List<Holiday> holidays = holidayRepository.findByDateBetween(startDate, endDate);
        return holidays.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HolidayDTO> getHolidaysByYear(int year) {
        List<Holiday> holidays = holidayRepository.findByYear(year);
        return holidays.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Boolean> checkIfHoliday(LocalDate date) {
        Map<String, Boolean> response = new HashMap<>();
        
        log.debug("Checking if {} is a holiday", date);
        
        // Check if the date is a holiday
        Optional<Holiday> holidayOpt = holidayRepository.findByDate(date);
        if (holidayOpt.isPresent()) {
            Holiday holiday = holidayOpt.get();
            log.info("Found holiday: {} for date: {}", holiday.getName(), date);
            response.put("isHoliday", true);
            
            // Store the actual name and description in thread local for retrieval
            HolidayThreadLocal.setHolidayName(holiday.getName());
            HolidayThreadLocal.setHolidayDescription(holiday.getDescription());
        } else {
            log.info("No holiday found for date: {}", date);
            response.put("isHoliday", false);
        }
        
        return response;
    }

    @Override
    public List<HolidayType> getHolidayTypes() {
        return Arrays.asList(HolidayType.values());
    }

    @Override
    @Transactional
    public List<HolidayDTO> addDefaultHolidays(int year) {
        // This is a simple implementation. You may want to expand this to include common holidays
        List<Holiday> defaultHolidays = new ArrayList<>();
        
        // Add some common holidays as examples
        defaultHolidays.add(createDefaultHoliday(LocalDate.of(year, 1, 1), "New Year's Day", "New Year's Day celebration", HolidayType.NATIONAL_HOLIDAY));
        defaultHolidays.add(createDefaultHoliday(LocalDate.of(year, 12, 25), "Christmas", "Christmas Day celebration", HolidayType.RELIGIOUS_HOLIDAY));
        
        List<Holiday> savedHolidays = holidayRepository.saveAll(defaultHolidays);
        return savedHolidays.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private Holiday createDefaultHoliday(LocalDate date, String name, String description, HolidayType type) {
        return Holiday.builder()
                .date(date)
                .name(name)
                .description(description)
                .type(type)
                .build();
    }

    private HolidayDTO convertToDTO(Holiday holiday) {
        return HolidayDTO.builder()
                .id(holiday.getId())
                .date(holiday.getDate())
                .name(holiday.getName())
                .description(holiday.getDescription())
                .type(holiday.getType())
                .createdAt(holiday.getCreatedAt())
                .updatedAt(holiday.getUpdatedAt())
                .build();
    }

    private Holiday convertToEntity(HolidayDTO holidayDTO) {
        return Holiday.builder()
                .id(holidayDTO.getId())
                .date(holidayDTO.getDate())
                .name(holidayDTO.getName())
                .description(holidayDTO.getDescription())
                .type(holidayDTO.getType())
                .build();
    }
}
