package com.school.hrm.service;

import com.school.hrm.dto.SchoolHolidayDTO;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface SchoolHolidayService {
    SchoolHolidayDTO addHoliday(SchoolHolidayDTO holidayDTO);

    SchoolHolidayDTO updateHoliday(Long id, SchoolHolidayDTO holidayDTO);

    SchoolHolidayDTO getHolidayById(Long id);

    SchoolHolidayDTO getHolidayByDate(LocalDate date);

    List<SchoolHolidayDTO> getAllHolidays();

    List<SchoolHolidayDTO> getHolidaysByDateRange(LocalDate startDate, LocalDate endDate);

    List<SchoolHolidayDTO> getHolidaysByType(String type);

    void deleteHoliday(Long id);

    Map<String, Object> getHolidaysCalendar(int year);

    List<SchoolHolidayDTO> addDefaultIndianNationalHolidays(int year);

    boolean isHoliday(LocalDate date);
}
