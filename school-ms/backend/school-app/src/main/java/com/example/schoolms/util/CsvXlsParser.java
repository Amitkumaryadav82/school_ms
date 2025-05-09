package com.example.schoolms.util;

import com.example.schoolms.model.Staff;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Component("csvXlsParser") // Added a specific bean name to match the qualifier
public class CsvXlsParser {

    private static final Logger logger = LoggerFactory.getLogger(CsvXlsParser.class);

    public List<Staff> parseStaffFromFile(MultipartFile file) throws IOException {
        List<Staff> staffList = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            // Skip header line
            String line = reader.readLine();
            if (line == null) {
                throw new IOException("File is empty");
            }

            // Process data rows
            while ((line = reader.readLine()) != null) {
                if (StringUtils.isBlank(line)) {
                    continue;
                }

                String[] fields = line.split(",");
                if (fields.length < 5) {
                    logger.warn("Skipping line with insufficient data: {}", line);
                    continue;
                }

                Staff staff = new Staff();
                staff.setStaffId(fields[0].trim());
                staff.setFirstName(fields[1].trim());

                // Set middle name if available
                if (fields.length > 5 && StringUtils.isNotBlank(fields[2].trim())) {
                    staff.setMiddleName(fields[2].trim());
                    staff.setLastName(fields[3].trim());
                    staff.setEmail(fields[4].trim());
                    staff.setPhone(fields.length > 6 ? fields[5].trim() : null);
                    staff.setRole(fields.length > 7 ? fields[6].trim() : "TEACHER");
                } else {
                    staff.setLastName(fields[2].trim());
                    staff.setEmail(fields[3].trim());
                    staff.setPhone(fields.length > 4 ? fields[4].trim() : null);
                    staff.setRole(fields.length > 5 ? fields[5].trim() : "TEACHER");
                }

                staffList.add(staff);
            }
        }

        return staffList;
    }
}