package com.school.hrm.service;

import com.school.hrm.dto.HolidayDTO;
import com.school.hrm.model.Holiday.HolidayType;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface HolidayService {
    HolidayDTO createHoliday(HolidayDTO holidayDTO);
    
    HolidayDTO updateHoliday(Long id, HolidayDTO holidayDTO);
    
    void deleteHoliday(Long id);
    
    HolidayDTO getHolidayById(Long id);
    
    HolidayDTO getHolidayByDate(LocalDate date);
    
    List<HolidayDTO> getAllHolidays();
    
    List<HolidayDTO> getHolidaysByDateRange(LocalDate startDate, LocalDate endDate);
    
    List<HolidayDTO> getHolidaysByYear(int year);
    
    Map<String, Boolean> checkIfHoliday(LocalDate date);
    
    List<HolidayType> getHolidayTypes();
    
    List<HolidayDTO> addDefaultHolidays(int year);
}
