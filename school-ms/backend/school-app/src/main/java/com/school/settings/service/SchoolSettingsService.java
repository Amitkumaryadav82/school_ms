package com.school.settings.service;

import com.school.settings.dto.SchoolSettingsDTO;
import com.school.settings.model.SchoolSettings;
import com.school.settings.repository.SchoolSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class SchoolSettingsService {
    private final SchoolSettingsRepository repository;

    public SchoolSettingsService(SchoolSettingsRepository repository) {
        this.repository = repository;
    }

    public SchoolSettings getOrCreate() {
        return repository.findById(1L).orElseGet(() -> {
            SchoolSettings s = SchoolSettings.builder()
                    .id(1L)
                    .schoolName("Your School Name")
                    .addressLine1("")
                    .city("")
                    .country("")
                    .phone("")
                    .email("")
                    .receiptPrefix("R")
                    .updatedAt(LocalDateTime.now())
                    .build();
            return repository.save(s);
        });
    }

    public SchoolSettings update(SchoolSettingsDTO dto) {
        SchoolSettings entity = getOrCreate();
        entity.setSchoolName(dto.getSchoolName());
        entity.setAddressLine1(dto.getAddressLine1());
        entity.setAddressLine2(dto.getAddressLine2());
        entity.setCity(dto.getCity());
        entity.setState(dto.getState());
        entity.setPostalCode(dto.getPostalCode());
        entity.setCountry(dto.getCountry());
        entity.setPhone(dto.getPhone());
        entity.setEmail(dto.getEmail());
        entity.setLogoUrl(dto.getLogoUrl());
        if (dto.getReceiptPrefix() != null && !dto.getReceiptPrefix().isBlank()) {
            entity.setReceiptPrefix(dto.getReceiptPrefix());
        }
        entity.setUpdatedAt(LocalDateTime.now());
        return repository.save(entity);
    }
}
