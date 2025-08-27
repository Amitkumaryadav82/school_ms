package com.school.settings.repository;

import com.school.settings.model.SchoolSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolSettingsRepository extends JpaRepository<SchoolSettings, Long> {
}
