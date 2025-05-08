package com.school.staff.util;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.example.schoolms.model.Staff;
import com.example.schoolms.util.CsvXlsParser;

/**
 * Adapter class for parsing CSV and Excel files for staff data
 */
@Component
public class CsvXlsParserAdapter {

    private final CsvXlsParser csvXlsParser;

    @Autowired
    public CsvXlsParserAdapter(@Qualifier("csvXlsParser") CsvXlsParser csvXlsParser) {
        this.csvXlsParser = csvXlsParser;
    }

    /**
     * Parse staff data from a CSV or Excel file
     * @param file The uploaded file containing staff data
     * @return List of staff objects parsed from the file
     * @throws IOException If there's an error reading the file
     */
    public List<Staff> parseStaffFromFile(MultipartFile file) throws IOException {
        // Delegate to the actual implementation
        return csvXlsParser.parseStaffFromFile(file);
    }
}