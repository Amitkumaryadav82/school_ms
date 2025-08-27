package com.school.settings.controller;

import com.school.settings.dto.SchoolSettingsDTO;
import com.school.settings.model.SchoolSettings;
import com.school.settings.service.SchoolSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings/school")
public class SchoolSettingsController {
    private final SchoolSettingsService service;

    public SchoolSettingsController(SchoolSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<SchoolSettings> get() {
        return ResponseEntity.ok(service.getOrCreate());
    }

    @PutMapping
    public ResponseEntity<SchoolSettings> update(@RequestBody SchoolSettingsDTO dto) {
        return ResponseEntity.ok(service.update(dto));
    }
}
