package com.school.settings.service;

import com.school.settings.model.SchoolSettings;
import com.school.settings.repository.SchoolSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.DecimalFormat;

@Service
public class ReceiptNumberService {
    private final SchoolSettingsRepository settingsRepository;

    public ReceiptNumberService(SchoolSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    /**
     * Very simple sequential receipt generator stored in memory for now.
     * In production, this should be a database sequence.
     */
    private long counter = 0L;

    @Transactional(readOnly = true)
    public String nextReceiptNumber() {
        SchoolSettings s = settingsRepository.findById(1L).orElse(null);
        String prefix = s != null && s.getReceiptPrefix() != null ? s.getReceiptPrefix() : "R";
        String number = new DecimalFormat("000000").format(++counter);
        if (!prefix.endsWith("-")) {
            // keep simple prefix like R000001 when prefix is 'R'
            return prefix + number;
        }
        return prefix + number;
    }
}
