package com.school.timetable.repository;

import com.school.timetable.model.TimetableSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TimetableSettingsRepository extends JpaRepository<TimetableSettings, Long> {
	Optional<TimetableSettings> findTopByOrderByIdAsc();
}
