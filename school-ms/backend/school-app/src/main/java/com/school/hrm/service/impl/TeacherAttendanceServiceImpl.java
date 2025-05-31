package com.school.hrm.service.impl;

import com.school.hrm.dto.TeacherAttendanceDTO;
import com.school.hrm.dto.BulkAttendanceRequestDTO;
import com.school.hrm.model.TeacherAttendance;
import com.school.hrm.model.AttendanceStatus;
import com.school.hrm.model.Employee;
import com.school.hrm.repository.TeacherAttendanceRepository;
import com.school.hrm.repository.EmployeeRepository;
import com.school.hrm.service.TeacherAttendanceService;
import com.school.hrm.service.SchoolHolidayService;
import com.school.hrm.exception.ResourceNotFoundException;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeacherAttendanceServiceImpl implements TeacherAttendanceService {

    private final TeacherAttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final SchoolHolidayService holidayService;

    @Autowired
    public TeacherAttendanceServiceImpl(
            TeacherAttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository,
            SchoolHolidayService holidayService) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.holidayService = holidayService;
    }

    @Override
    @Transactional
    public TeacherAttendanceDTO markAttendance(TeacherAttendanceDTO attendanceDTO) {
        // Find employee
        Employee employee = employeeRepository.findById(attendanceDTO.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", attendanceDTO.getEmployeeId()));

        // Check if the date is a holiday
        if (holidayService.isHoliday(attendanceDTO.getAttendanceDate()) &&
                attendanceDTO.getAttendanceStatus() != AttendanceStatus.HOLIDAY) {
            throw new IllegalArgumentException("The selected date is a holiday. Status should be set to HOLIDAY.");
        }

        // Check if attendance record already exists for this employee and date
        Optional<TeacherAttendance> existingAttendance = attendanceRepository.findByEmployeeAndAttendanceDate(employee,
                attendanceDTO.getAttendanceDate());

        TeacherAttendance attendance;
        if (existingAttendance.isPresent()) {
            // Update existing record
            attendance = existingAttendance.get();
            attendance.setAttendanceStatus(attendanceDTO.getAttendanceStatus());
            attendance.setReason(attendanceDTO.getReason());
            attendance.setRemarks(attendanceDTO.getRemarks());
            attendance.setLastModifiedBy(attendanceDTO.getLastModifiedBy());
        } else {
            // Create new record
            attendance = TeacherAttendance.builder()
                    .employee(employee)
                    .attendanceDate(attendanceDTO.getAttendanceDate())
                    .attendanceStatus(attendanceDTO.getAttendanceStatus())
                    .reason(attendanceDTO.getReason())
                    .remarks(attendanceDTO.getRemarks())
                    .markedBy(attendanceDTO.getMarkedBy())
                    .lastModifiedBy(attendanceDTO.getLastModifiedBy())
                    .build();
        }

        TeacherAttendance savedAttendance = attendanceRepository.save(attendance);
        return mapToDTO(savedAttendance);
    }

    @Override
    @Transactional
    public TeacherAttendanceDTO updateAttendance(Long id, TeacherAttendanceDTO attendanceDTO) {
        // Find existing attendance record
        TeacherAttendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record", "id", id));

        // Find employee if employee ID has changed
        Employee employee = attendance.getEmployee();
        if (!attendance.getEmployee().getId().equals(attendanceDTO.getEmployeeId())) {
            employee = employeeRepository.findById(attendanceDTO.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", attendanceDTO.getEmployeeId()));
        }

        // Check if the date is a holiday
        if (holidayService.isHoliday(attendanceDTO.getAttendanceDate()) &&
                attendanceDTO.getAttendanceStatus() != AttendanceStatus.HOLIDAY) {
            throw new IllegalArgumentException("The selected date is a holiday. Status should be set to HOLIDAY.");
        }

        // Update the record
        attendance.setEmployee(employee);
        attendance.setAttendanceDate(attendanceDTO.getAttendanceDate());
        attendance.setAttendanceStatus(attendanceDTO.getAttendanceStatus());
        attendance.setReason(attendanceDTO.getReason());
        attendance.setRemarks(attendanceDTO.getRemarks());
        attendance.setLastModifiedBy(attendanceDTO.getLastModifiedBy());

        TeacherAttendance updatedAttendance = attendanceRepository.save(attendance);
        return mapToDTO(updatedAttendance);
    }

    @Override
    public TeacherAttendanceDTO getAttendanceById(Long id) {
        TeacherAttendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record", "id", id));
        return mapToDTO(attendance);
    }

    @Override
    @Transactional
    public void deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attendance record", "id", id);
        }
        attendanceRepository.deleteById(id);
    }

    @Override
    @Transactional
    public List<TeacherAttendanceDTO> markBulkAttendance(BulkAttendanceRequestDTO bulkRequest) {
        LocalDate date = bulkRequest.getDate();
        List<TeacherAttendanceDTO> savedRecords = new ArrayList<>();

        // Check if the date is a holiday
        boolean isHoliday = holidayService.isHoliday(date);

        for (BulkAttendanceRequestDTO.SingleAttendanceDTO record : bulkRequest.getAttendanceRecords()) {
            try {
                // Find employee
                Employee employee = employeeRepository.findById(record.getEmployeeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", record.getEmployeeId()));

                // Parse status
                AttendanceStatus status;
                try {
                    status = AttendanceStatus.valueOf(record.getStatus().toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Invalid attendance status: " + record.getStatus());
                }

                // Validate status if it's a holiday
                if (isHoliday && status != AttendanceStatus.HOLIDAY) {
                    throw new IllegalArgumentException(
                            "The selected date is a holiday. Status should be set to HOLIDAY for employee: "
                                    + employee.getFirstName() + " " + employee.getLastName());
                }

                // Create or update attendance record
                TeacherAttendanceDTO attendanceDTO = new TeacherAttendanceDTO();
                attendanceDTO.setEmployeeId(record.getEmployeeId());
                attendanceDTO.setAttendanceDate(date);
                attendanceDTO.setAttendanceStatus(status);
                attendanceDTO.setReason(record.getReason());

                savedRecords.add(markAttendance(attendanceDTO));
            } catch (Exception e) {
                // Log the error and continue with the next record
                System.err.println("Error processing attendance for employee ID " + record.getEmployeeId() + ": "
                        + e.getMessage());
            }
        }

        return savedRecords;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> processAttendanceFile(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> parsedRecords = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            // Get the date from the header (usually in cell A1)
            Row headerRow = sheet.getRow(0);
            String dateStr = headerRow.getCell(1).getStringCellValue();
            LocalDate attendanceDate = LocalDate.parse(dateStr.trim(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            // Check if it's a holiday
            boolean isHoliday = holidayService.isHoliday(attendanceDate);

            // Process data rows (starting from row 2)
            for (int i = 2; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                Map<String, Object> recordData = new HashMap<>();
                try {
                    // Get employee ID
                    Cell employeeIdCell = row.getCell(0);
                    if (employeeIdCell == null)
                        continue;

                    Long employeeId;
                    if (employeeIdCell.getCellType() == CellType.NUMERIC) {
                        employeeId = (long) employeeIdCell.getNumericCellValue();
                    } else {
                        employeeId = Long.parseLong(employeeIdCell.getStringCellValue());
                    }

                    // Get employee details
                    Employee employee = employeeRepository.findById(employeeId)
                            .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

                    // Get status
                    Cell statusCell = row.getCell(3);
                    String statusStr = statusCell.getStringCellValue().trim();
                    AttendanceStatus status;

                    try {
                        status = AttendanceStatus.valueOf(statusStr.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        throw new IllegalArgumentException("Invalid status: " + statusStr);
                    }

                    // Validate status if it's a holiday
                    if (isHoliday && status != AttendanceStatus.HOLIDAY) {
                        throw new IllegalArgumentException("The date is a holiday. Status must be HOLIDAY.");
                    }

                    // Get reason (optional)
                    String reason = "";
                    Cell reasonCell = row.getCell(4);
                    if (reasonCell != null) {
                        reason = reasonCell.getStringCellValue();
                    }

                    // Populate the record data
                    recordData.put("employeeId", employeeId);
                    recordData.put("employeeName", employee.getFirstName() + " " + employee.getLastName());
                    recordData.put("department", employee.getDepartment());
                    recordData.put("status", status.name());
                    recordData.put("reason", reason);
                    recordData.put("valid", true);

                    parsedRecords.add(recordData);

                } catch (Exception e) {
                    recordData.put("rowNum", i + 1);
                    recordData.put("error", e.getMessage());
                    recordData.put("valid", false);

                    parsedRecords.add(recordData);
                    errors.add("Error in row " + (i + 1) + ": " + e.getMessage());
                }
            }

            result.put("attendanceDate", attendanceDate);
            result.put("totalRecords", parsedRecords.size());
            result.put("validRecords", parsedRecords.stream().filter(r -> (boolean) r.get("valid")).count());
            result.put("records", parsedRecords);
            result.put("errors", errors);

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", "Failed to process file: " + e.getMessage());
        }

        return result;
    }

    @Override
    public List<TeacherAttendanceDTO> getAttendanceByDate(LocalDate date) {
        List<TeacherAttendance> attendanceList = attendanceRepository.findByAttendanceDate(date);
        return attendanceList.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TeacherAttendanceDTO> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate) {
        List<TeacherAttendance> attendanceList = attendanceRepository.findByAttendanceDateBetween(startDate, endDate);
        return attendanceList.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TeacherAttendanceDTO> getAttendanceByEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        List<TeacherAttendance> attendanceList = attendanceRepository.findByEmployee(employee);
        return attendanceList.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TeacherAttendanceDTO> getAttendanceByEmployeeAndDateRange(Long employeeId, LocalDate startDate,
            LocalDate endDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        List<TeacherAttendance> attendanceList = attendanceRepository.findByEmployeeAndAttendanceDateBetween(employee,
                startDate, endDate);

        return attendanceList.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public byte[] generateAttendanceTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            // Create the attendance sheet
            Sheet sheet = workbook.createSheet("Attendance");

            // Create date header
            Row dateRow = sheet.createRow(0);
            Cell dateLabelCell = dateRow.createCell(0);
            dateLabelCell.setCellValue("Date:");

            Cell dateValueCell = dateRow.createCell(1);
            dateValueCell.setCellValue(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

            // Create column headers
            Row headerRow = sheet.createRow(1);
            headerRow.createCell(0).setCellValue("Employee ID");
            headerRow.createCell(1).setCellValue("Name");
            headerRow.createCell(2).setCellValue("Department");
            headerRow.createCell(3).setCellValue("Status");
            headerRow.createCell(4).setCellValue("Reason");

            // Create cell styles
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Apply styles
            for (int i = 0; i < 5; i++) {
                headerRow.getCell(i).setCellStyle(headerStyle);
            }

            // Get all active teaching staff
            List<Employee> teachers = employeeRepository.findAll().stream()
                    .filter(e -> e.getStatus().name().equals("ACTIVE"))
                    .collect(Collectors.toList());

            // Add employees to template
            int rowNum = 2;
            for (Employee teacher : teachers) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(teacher.getId());
                row.createCell(1).setCellValue(teacher.getFirstName() + " " + teacher.getLastName());
                row.createCell(2).setCellValue(teacher.getDepartment());
                // Status cell - create a dropdown with possible values
                Cell statusCell = row.createCell(3);
                statusCell.setCellValue("PRESENT"); // Default value
            }

            // Auto-size columns
            for (int i = 0; i < 5; i++) {
                sheet.autoSizeColumn(i);
            }

            // Add a validation sheet with possible status values
            Sheet validationSheet = workbook.createSheet("Validation");
            Row validationRow = validationSheet.createRow(0);
            validationRow.createCell(0).setCellValue("Status Values");

            // Add status values
            int valRowNum = 1;
            for (AttendanceStatus status : AttendanceStatus.values()) {
                validationSheet.createRow(valRowNum++).createCell(0).setCellValue(status.name());
            }

            // Hide the validation sheet
            workbook.setSheetHidden(1, true);

            // Create name for the status values range
            Name statusValuesRange = workbook.createName();
            statusValuesRange.setNameName("StatusValues");
            statusValuesRange.setRefersToFormula("Validation!$A$2:$A$" + (AttendanceStatus.values().length + 1));

            // Create data validation for status cells
            DataValidationHelper validationHelper = sheet.getDataValidationHelper();
            DataValidationConstraint constraint = validationHelper.createFormulaListConstraint("StatusValues");

            CellRangeAddressList addressList = new CellRangeAddressList(2, 1000, 3, 3);
            DataValidation validation = validationHelper.createValidation(constraint, addressList);
            validation.setShowErrorBox(true);

            sheet.addValidationData(validation);

            // Write to byte array
            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                workbook.write(out);
                return out.toByteArray();
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate attendance template: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getAttendanceStatsByEmployee(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        // Get attendance records for the employee in the date range
        List<TeacherAttendance> attendanceList = attendanceRepository.findByEmployeeAndAttendanceDateBetween(employee,
                startDate, endDate);

        // Count days by status
        Map<AttendanceStatus, Long> statusCounts = attendanceList.stream()
                .collect(Collectors.groupingBy(TeacherAttendance::getAttendanceStatus, Collectors.counting()));

        // Get dates by status
        Map<AttendanceStatus, List<String>> datesByStatus = new HashMap<>();
        for (AttendanceStatus status : AttendanceStatus.values()) {
            List<LocalDate> dates = attendanceRepository.findAttendanceDatesByEmployeeAndStatusAndDateBetween(
                    employee, status, startDate, endDate);

            datesByStatus.put(status, dates.stream()
                    .map(d -> d.format(DateTimeFormatter.ISO_DATE))
                    .collect(Collectors.toList()));
        }

        // Calculate total working days in the period (excluding weekends and holidays)
        long totalWorkingDays = calculateWorkingDays(startDate, endDate);

        // Calculate attendance percentage
        long presentDays = statusCounts.getOrDefault(AttendanceStatus.PRESENT, 0L) +
                (statusCounts.getOrDefault(AttendanceStatus.HALF_DAY, 0L) / 2);

        double attendancePercentage = totalWorkingDays > 0
                ? (double) presentDays / totalWorkingDays * 100
                : 0;

        // Prepare result
        Map<String, Object> result = new HashMap<>();
        result.put("employeeId", employee.getId());
        result.put("employeeName", employee.getFirstName() + " " + employee.getLastName());
        result.put("department", employee.getDepartment());
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("totalWorkingDays", totalWorkingDays);
        result.put("presentDays", statusCounts.getOrDefault(AttendanceStatus.PRESENT, 0L));
        result.put("absentDays", statusCounts.getOrDefault(AttendanceStatus.ABSENT, 0L));
        result.put("halfDays", statusCounts.getOrDefault(AttendanceStatus.HALF_DAY, 0L));
        result.put("leaveDays", statusCounts.getOrDefault(AttendanceStatus.ON_LEAVE, 0L));
        result.put("attendancePercentage", String.format("%.2f", attendancePercentage));
        result.put("datesByStatus", datesByStatus);

        return result;
    }

    @Override
    public Map<String, Object> getAttendanceOverview(LocalDate startDate, LocalDate endDate) {
        List<TeacherAttendance> attendanceList = attendanceRepository.findByAttendanceDateBetween(startDate, endDate);

        // Calculate total working days
        long totalWorkingDays = calculateWorkingDays(startDate, endDate);

        // Group by date
        Map<LocalDate, Map<AttendanceStatus, Long>> attendanceByDate = attendanceList.stream()
                .collect(Collectors.groupingBy(
                        TeacherAttendance::getAttendanceDate,
                        Collectors.groupingBy(TeacherAttendance::getAttendanceStatus, Collectors.counting())));

        // Group by department
        Map<String, Map<AttendanceStatus, Long>> attendanceByDepartment = attendanceList.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getEmployee().getDepartment(),
                        Collectors.groupingBy(TeacherAttendance::getAttendanceStatus, Collectors.counting())));

        // Format data for response
        Map<String, Object> result = new HashMap<>();
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("totalWorkingDays", totalWorkingDays);

        // Format attendance by date
        Map<String, Map<String, Long>> dateData = new LinkedHashMap<>();
        attendanceByDate.forEach((date, statusMap) -> {
            Map<String, Long> formattedStatusMap = new HashMap<>();
            statusMap.forEach((status, count) -> formattedStatusMap.put(status.name(), count));
            dateData.put(date.format(DateTimeFormatter.ISO_DATE), formattedStatusMap);
        });
        result.put("attendanceByDate", dateData);

        // Format attendance by department
        Map<String, Map<String, Long>> departmentData = new HashMap<>();
        attendanceByDepartment.forEach((dept, statusMap) -> {
            Map<String, Long> formattedStatusMap = new HashMap<>();
            statusMap.forEach((status, count) -> formattedStatusMap.put(status.name(), count));
            departmentData.put(dept, formattedStatusMap);
        });
        result.put("attendanceByDepartment", departmentData);

        return result;
    }

    @Override
    public Map<String, Object> getMonthlyAttendanceReport(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        // Get all employees
        List<Employee> employees = employeeRepository.findAll();

        // Get all attendance records for the month
        List<TeacherAttendance> attendanceList = attendanceRepository.findByAttendanceDateBetween(startDate, endDate);

        // Group attendance by employee
        Map<Employee, List<TeacherAttendance>> attendanceByEmployee = attendanceList.stream()
                .collect(Collectors.groupingBy(TeacherAttendance::getEmployee));

        // Calculate working days in the month (excluding weekends and holidays)
        long totalWorkingDays = calculateWorkingDays(startDate, endDate);

        // Generate employee-wise attendance summary
        List<Map<String, Object>> employeeSummaries = new ArrayList<>();
        for (Employee employee : employees) {
            Map<String, Object> summary = new HashMap<>();
            summary.put("employeeId", employee.getId());
            summary.put("employeeName", employee.getFirstName() + " " + employee.getLastName());
            summary.put("department", employee.getDepartment());

            List<TeacherAttendance> employeeAttendance = attendanceByEmployee.getOrDefault(employee, List.of());

            // Count by status
            Map<AttendanceStatus, Long> statusCounts = employeeAttendance.stream()
                    .collect(Collectors.groupingBy(TeacherAttendance::getAttendanceStatus, Collectors.counting()));

            long presentDays = statusCounts.getOrDefault(AttendanceStatus.PRESENT, 0L);
            long halfDays = statusCounts.getOrDefault(AttendanceStatus.HALF_DAY, 0L);
            long absentDays = statusCounts.getOrDefault(AttendanceStatus.ABSENT, 0L);
            long leaveDays = statusCounts.getOrDefault(AttendanceStatus.ON_LEAVE, 0L);

            // Calculate attendance percentage
            double attendancePercentage = totalWorkingDays > 0
                    ? (double) (presentDays + (halfDays / 2)) / totalWorkingDays * 100
                    : 0;

            summary.put("presentDays", presentDays);
            summary.put("halfDays", halfDays);
            summary.put("absentDays", absentDays);
            summary.put("leaveDays", leaveDays);
            summary.put("attendancePercentage", String.format("%.2f", attendancePercentage));

            // Daily attendance status
            Map<String, String> dailyStatus = new HashMap<>();
            employeeAttendance.forEach(a -> dailyStatus.put(a.getAttendanceDate().format(DateTimeFormatter.ISO_DATE),
                    a.getAttendanceStatus().name()));

            summary.put("dailyStatus", dailyStatus);

            employeeSummaries.add(summary);
        }

        // Prepare result
        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("month", month);
        result.put("monthName", Month.of(month).name());
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("totalWorkingDays", totalWorkingDays);
        result.put("employeeSummaries", employeeSummaries);

        return result;
    }

    // Helper method to calculate working days (excluding weekends and holidays)
    private long calculateWorkingDays(LocalDate startDate, LocalDate endDate) {
        long totalDays = 0;
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            // Skip weekends (Saturday and Sunday)
            if (currentDate.getDayOfWeek().getValue() < 6 && !holidayService.isHoliday(currentDate)) {
                totalDays++;
            }
            currentDate = currentDate.plusDays(1);
        }

        return totalDays;
    }

    // Helper method to map entity to DTO
    private TeacherAttendanceDTO mapToDTO(TeacherAttendance attendance) {
        Employee employee = attendance.getEmployee();
        return TeacherAttendanceDTO.builder()
                .id(attendance.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .employeeEmail(employee.getEmail())
                .departmentName(employee.getDepartment())
                .attendanceDate(attendance.getAttendanceDate())
                .attendanceStatus(attendance.getAttendanceStatus())
                .reason(attendance.getReason())
                .remarks(attendance.getRemarks())
                .markedBy(attendance.getMarkedBy())
                .lastModifiedBy(attendance.getLastModifiedBy())
                .build();
    }
}
