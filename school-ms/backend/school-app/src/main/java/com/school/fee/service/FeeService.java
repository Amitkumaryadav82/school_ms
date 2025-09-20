package com.school.fee.service;

import com.school.fee.model.Fee;
import com.school.fee.model.Payment;
import com.school.fee.model.FeePaymentSchedule;
import com.school.fee.repository.FeeRepository;
import com.school.fee.repository.PaymentRepository;
import com.school.fee.repository.FeePaymentScheduleRepository;
import com.school.fee.dto.*;
import com.school.fee.exception.FeeNotFoundException;
import com.school.student.model.Student;
import com.school.student.service.StudentService;
import com.school.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class FeeService {
    private static final Logger log = LoggerFactory.getLogger(FeeService.class);

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private FeePaymentScheduleRepository scheduleRepository;

    @Autowired
    private StudentService studentService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.school.settings.service.ReceiptNumberService receiptNumberService;

    @Autowired
    private com.school.settings.service.SchoolSettingsService schoolSettingsService;

    public Fee createFee(FeeRequest request) {
        Fee fee = Fee.builder()
                .name(request.getName())
                .grade(request.getGrade())
                .amount(request.getAmount())
                .dueDate(request.getDueDate())
                .feeType(request.getFeeType())
                .description(request.getDescription())
                .frequency(request.getFrequency())
                .build();

        return feeRepository.save(fee);
    }

    public Fee updateFee(Long id, FeeRequest request) {
        Fee fee = getFee(id);

        fee.setName(request.getName());
        fee.setGrade(request.getGrade());
        fee.setAmount(request.getAmount());
        fee.setDueDate(request.getDueDate());
        fee.setFeeType(request.getFeeType());
        fee.setDescription(request.getDescription());
        fee.setFrequency(request.getFrequency());

        return feeRepository.save(fee);
    }

    public Fee getFee(Long id) {
        return feeRepository.findById(id)
                .orElseThrow(() -> new FeeNotFoundException("Fee not found with id: " + id));
    }

    public List<Fee> getFeesByGrade(Integer grade) {
        List<Fee> fees = feeRepository.findByGrade(grade);

        // If no fees found for the grade, log this for debugging
        if (fees.isEmpty() && grade != null) {
            log.debug("No fees found for grade: {}", grade);

            // Create default fee for any grade if none exists
            log.info("Creating default fee for Grade {}", grade);
            // Check if any default fees exist that we can use as template
            List<Fee> defaultFees = feeRepository.findAll();
            if (!defaultFees.isEmpty()) {
                Fee templateFee = defaultFees.get(0);
                Fee defaultFee = new Fee();
                defaultFee.setName("Tuition Fee - Grade " + grade);
                defaultFee.setGrade(grade);
                defaultFee.setAmount(templateFee.getAmount());
                defaultFee.setDueDate(LocalDate.now().plusMonths(1));
                defaultFee.setFeeType(Fee.FeeType.TUITION);
                defaultFee.setFrequency(Fee.FeeFrequency.MONTHLY);
                defaultFee.setDescription("Default tuition fee for Grade " + grade);

                Fee savedFee = feeRepository.save(defaultFee);
                fees = List.of(savedFee);
            }
        }
        return fees;
    }

    public List<Fee> getFeesByDueDateRange(LocalDate startDate, LocalDate endDate) {
        return feeRepository.findByDueDateBetween(startDate, endDate);
    }

    public Payment processPayment(PaymentRequest request) {
        // Resolve the student
        Student student = studentService.getStudent(request.getStudentId());

        // Resolve the fee: try by provided ID, then by student's grade, else create a
        // sensible default
        Fee fee = null;
        if (request.getFeeId() != null) {
            fee = feeRepository.findById(request.getFeeId()).orElse(null);
        }
        if (fee == null) {
            List<Fee> gradeFees = getFeesByGrade(student.getGrade());
            if (gradeFees != null && !gradeFees.isEmpty()) {
                fee = gradeFees.stream()
                        .filter(f -> f.getFeeType() == Fee.FeeType.TUITION)
                        .findFirst()
                        .orElse(gradeFees.get(0));
                log.info("Resolved feeId {} for student {} using grade-based fallback", fee.getId(), student.getId());
            } else {
                // No fees configured anywhere; create a default tuition fee using the request
                // amount
                log.info("No fees configured for Grade {}. Creating a default tuition fee for payment processing.",
                        student.getGrade());
                Fee defaultFee = new Fee();
                defaultFee.setName("Tuition Fee - Grade " + student.getGrade());
                defaultFee.setGrade(student.getGrade());
                defaultFee.setAmount(Optional.ofNullable(request.getAmount()).orElse(0.0));
                defaultFee.setDueDate(LocalDate.now().plusMonths(1));
                defaultFee.setFeeType(Fee.FeeType.TUITION);
                defaultFee.setFrequency(Fee.FeeFrequency.MONTHLY);
                defaultFee.setDescription("Auto-created tuition fee for Grade " + student.getGrade());
                fee = feeRepository.save(defaultFee);
            }
        }

        // Ensure we have a proper receipt number. If not provided, generate one.
        String receiptNo = request.getReceiptNumber();
        if (receiptNo == null || receiptNo.isBlank()) {
            receiptNo = receiptNumberService.nextReceiptNumber();
        }

        Payment payment = Payment.builder()
                .fee(fee)
                .student(student)
                .amount(request.getAmount())
                .paymentDate(LocalDateTime.now())
                .paymentMethod(request.getPaymentMethod())
                .transactionReference(request.getTransactionReference())
                .status(Payment.PaymentStatus.COMPLETED)
                .remarks(request.getRemarks())
                .payerName(request.getPayerName())
                .payerContactInfo(request.getPayerContactInfo())
                .payerRelationToStudent(request.getPayerRelationToStudent())
                .receiptNumber(receiptNo)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        sendPaymentConfirmationEmail(student, savedPayment);

        return savedPayment;
    }

    public List<Payment> getStudentPayments(Long studentId) {
        return paymentRepository.findByStudentId(studentId);
    }

    /**
     * Returns all payments. For large datasets, consider adding pagination.
     */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public java.util.Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    public java.util.Optional<Payment> getPaymentByReceiptNumber(String receiptNumber) {
        if (receiptNumber == null || receiptNumber.isBlank())
            return java.util.Optional.empty();
        return paymentRepository.findByReceiptNumber(receiptNumber);
    }

    public boolean voidPayment(Long id, String reason) {
        Optional<Payment> opt = paymentRepository.findById(id);
        if (!opt.isPresent())
            return false;
        Payment p = opt.get();
        p.setStatus(Payment.PaymentStatus.VOID);
        p.setVoidedAt(java.time.LocalDateTime.now());
        if (reason != null && !reason.isBlank()) {
            p.setVoidReason(reason);
        }
        if (reason != null && !reason.isBlank()) {
            String existing = Optional.ofNullable(p.getRemarks()).orElse("");
            String updated = existing.isBlank() ? ("Voided: " + reason) : (existing + " | Voided: " + reason);
            p.setRemarks(updated);
        }
        paymentRepository.save(p);
        return true;
    }

    public java.util.Optional<byte[]> generateReceiptPdf(Long id) {
        Optional<Payment> opt = paymentRepository.findById(id);
        if (!opt.isPresent())
            return Optional.empty();
        Payment p = opt.get();
        try {
            // School header
            var settings = schoolSettingsService.getOrCreate();
            String schoolName = Optional.ofNullable(settings.getSchoolName()).orElse("School");
            java.util.List<String> addressParts = Arrays.asList(
                    settings.getAddressLine1(),
                    settings.getAddressLine2(),
                    settings.getCity(),
                    settings.getState(),
                    settings.getPostalCode(),
                    settings.getCountry());
            String address = addressParts.stream()
                    .filter(s -> s != null && !s.trim().isEmpty())
                    .collect(Collectors.joining(", "));
            String phone = settings.getPhone();
            String email = settings.getEmail();

            // Payment core
            String receiptNo = Optional.ofNullable(p.getReceiptNumber()).orElse("R" + String.format("%06d", p.getId()));
            LocalDate payDate = Optional.ofNullable(p.getPaymentDate()).map(LocalDateTime::toLocalDate)
                    .orElse(LocalDate.now());
            java.time.format.DateTimeFormatter df = java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy");
            double amount = Optional.ofNullable(p.getAmount()).orElse(0.0);

            // Student details
            com.school.student.model.Student student = p.getStudent() != null ? p.getStudent()
                    : studentService.getStudent(p.getStudentId());
            String studentName = ((Optional.ofNullable(student.getFirstName()).orElse("") + " "
                    + Optional.ofNullable(student.getLastName()).orElse("")).trim());
            if (studentName.isEmpty())
                studentName = "Student #" + student.getId();
            String className = (student.getGrade() != null ? ("Grade " + student.getGrade()) : "") +
                    (student.getSection() != null && !student.getSection().isEmpty() ? ("-" + student.getSection())
                            : "");

            // Payment details
            String paymentMethod = String.valueOf(p.getPaymentMethod());
            String paymentMethodLabel = mapPaymentMethod(paymentMethod);
            String paymentTypeLabel = mapFrequencyLabel(
                    p.getFee() != null ? String.valueOf(p.getFee().getFrequency()) : null);
            String reference = p.getTransactionReference();

            List<String> lines = new ArrayList<>();
            // Header block
            if (!address.isBlank())
                lines.add(address);
            if (phone != null && !phone.isBlank())
                lines.add("Phone: " + phone);
            if (email != null && !email.isBlank())
                lines.add("Email: " + email);
            lines.add("RECEIPT" + (p.getStatus() == Payment.PaymentStatus.VOID ? " (VOID)" : ""));
            lines.add(receiptNo);
            lines.add("Date: " + payDate.format(df));
            lines.add("TOTAL PAID: Rs. " + String.format(Locale.ENGLISH, "%,.2f", amount));
            lines.add(repeat('-'));

            // Student details block
            lines.add("STUDENT DETAILS");
            lines.add(studentName);
            if (!className.isBlank())
                lines.add("Class: " + className);
            lines.add("Student ID: "
                    + (p.getStudentId() != null ? p.getStudentId().toString() : String.valueOf(student.getId())));
            lines.add(repeat('-'));

            // Payment details block
            lines.add("PAYMENT DETAILS");
            lines.add("Payment Type: " + (paymentTypeLabel != null ? paymentTypeLabel : "Fee"));
            lines.add("Payment Method: " + paymentMethodLabel);
            if (reference != null && !reference.isBlank())
                lines.add("Reference: " + reference);
            lines.add(repeat('-'));

            // Line item
            String itemTitle = (paymentTypeLabel != null ? paymentTypeLabel : "")
                    + (paymentTypeLabel != null ? " " : "") + "Fee Payment";
            lines.add(itemTitle);
            if (p.getRemarks() != null && !p.getRemarks().isEmpty()) {
                lines.add("Notes: " + p.getRemarks());
            }
            lines.add("Amount: Rs. " + String.format(Locale.ENGLISH, "%,.2f", amount));
            lines.add(repeat('-'));
            lines.add("TOTAL PAID: Rs. " + String.format(Locale.ENGLISH, "%,.2f", amount));
            if (p.getStatus() == Payment.PaymentStatus.VOID) {
                lines.add(repeat('-'));
                java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter
                        .ofPattern("dd MMM yyyy HH:mm");
                lines.add("Date of Payment Void: " + (p.getVoidedAt() != null ? p.getVoidedAt().format(dtf) : "-"));
                lines.add("Reason: "
                        + (p.getVoidReason() != null && !p.getVoidReason().isBlank() ? p.getVoidReason() : "-"));
            }
            lines.add("");
            lines.add("Received with thanks");
            lines.add("This is a computer generated receipt and doesn't require a signature.");
            lines.add("");
            lines.add("____________________________");
            lines.add("Authorized Signature");

            byte[] pdf = com.school.common.util.SimplePdf.generate(lines, schoolName + " - Payment Receipt");
            return Optional.of(pdf);
        } catch (Exception e) {
            log.error("Failed to generate receipt export for {}: {}", id, e.getMessage(), e);
            return Optional.empty();
        }
    }

    private static String mapPaymentMethod(String method) {
        if (method == null)
            return "";
        switch (method) {
            case "CASH":
                return "Cash";
            case "CHEQUE":
                return "Cheque";
            case "CHECK":
                return "Check";
            case "BANK_TRANSFER":
                return "Bank Transfer";
            case "UPI":
                return "UPI";
            case "ONLINE":
                return "Online";
            case "CREDIT_CARD":
                return "Credit Card";
            default:
                return method;
        }
    }

    private static String mapFrequencyLabel(String frequency) {
        if (frequency == null)
            return null;
        switch (frequency) {
            case "MONTHLY":
                return "Monthly";
            case "QUARTERLY":
                return "Quarterly";
            case "HALF_YEARLY":
                return "Half-Yearly";
            case "YEARLY":
                return "Annual";
            default:
                return frequency;
        }
    }

    private static String repeat(char c) {
        char[] arr = new char[60];
        java.util.Arrays.fill(arr, c);
        return new String(arr);
    }

    public List<FeePaymentSummary> getStudentFeeSummary(Long studentId) {
        Student student = studentService.getStudent(studentId);
        List<Fee> applicableFees = getFeesByGrade(student.getGrade());
        List<Payment> payments = getStudentPayments(studentId);

        return applicableFees.stream()
                .map(fee -> createFeeSummary(fee, payments))
                .collect(Collectors.toList());
    }

    public SemesterFeeReport generateSemesterReport(Integer year, String semester) {
        LocalDate startDate = getSemesterStartDate(year, semester);
        LocalDate endDate = getSemesterEndDate(year, semester);

        List<Payment> payments = paymentRepository.findByPaymentDateBetween(
                startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59));

        Map<String, Double> feeTypeDistribution = calculateFeeTypeDistribution(payments);
        Map<String, Double> paymentMethodDistribution = calculatePaymentMethodDistribution(payments);
        List<FeePaymentSummary> gradewiseCollection = calculateGradewiseCollection(payments);

        return SemesterFeeReport.builder()
                .semester(semester)
                .year(year)
                .totalFeesCharged(calculateTotalFeesCharged(startDate, endDate))
                .totalCollected(calculateTotalCollected(payments))
                .totalPending(calculateTotalPending(startDate, endDate))
                .totalOverdue(calculateTotalOverdue(startDate))
                .totalStudents(calculateTotalStudents())
                .studentsWithDues(calculateStudentsWithDues(startDate))
                .feeTypeDistribution(feeTypeDistribution)
                .paymentMethodDistribution(paymentMethodDistribution)
                .gradewiseCollection(gradewiseCollection)
                .build();
    }

    public ClassSectionFeeReport generateClassSectionReport(Integer grade, String section) {
        List<Student> students = studentService.getStudentsByGradeAndSection(grade, section);

        if (students.isEmpty()) {
            return ClassSectionFeeReport.builder()
                    .grade(grade)
                    .section(section)
                    .academicYear(getCurrentFinancialYear() + "-" + (getCurrentFinancialYear() + 1))
                    .totalStudents(0)
                    .build();
        }

        List<Long> studentIds = students.stream().map(Student::getId).collect(Collectors.toList());

        List<Fee> fees = getFeesByGrade(grade);
        List<Payment> allPayments = new ArrayList<>();
        Map<Long, List<Payment>> paymentsByStudent = new HashMap<>();

        for (Long studentId : studentIds) {
            List<Payment> studentPayments = getStudentPayments(studentId);
            allPayments.addAll(studentPayments);
            paymentsByStudent.put(studentId, studentPayments);
        }

        Double totalFeesCharged = fees.stream().mapToDouble(Fee::getAmount).sum() * students.size();
        Double totalCollected = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .mapToDouble(Payment::getAmount).sum();

        Double totalPending = totalFeesCharged - totalCollected;

        Map<String, Double> feeTypeDistribution = calculateFeeTypeDistribution(allPayments);

        List<ClassSectionFeeReport.StudentFeeDetail> studentDetails = new ArrayList<>();
        int completePaymentCount = 0;
        int pendingPaymentCount = 0;
        int overduePaymentCount = 0;

        for (Student student : students) {
            List<Payment> studentPayments = paymentsByStudent.getOrDefault(student.getId(), Collections.emptyList());
            double totalFees = fees.stream().mapToDouble(Fee::getAmount).sum();
            double paidAmount = studentPayments.stream()
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                    .mapToDouble(Payment::getAmount).sum();
            double pendingAmount = totalFees - paidAmount;

            boolean isOverdue = fees.stream()
                    .anyMatch(fee -> fee.getDueDate().isBefore(LocalDate.now()) &&
                            studentPayments.stream()
                                    .filter(p -> p.getFee().getId().equals(fee.getId()))
                                    .mapToDouble(Payment::getAmount).sum() < fee.getAmount());

            FeePaymentSchedule activeSchedule = scheduleRepository
                    .findByStudentIdAndIsActiveTrue(student.getId())
                    .orElse(null);

            String paymentScheduleType = activeSchedule != null ? activeSchedule.getPaymentFrequency().toString()
                    : "NONE";

            ClassSectionFeeReport.StudentFeeDetail detail = ClassSectionFeeReport.StudentFeeDetail.builder()
                    .studentId(student.getId())
                    .studentName(student.getFirstName() + " " + student.getLastName())
                    .totalFees(totalFees)
                    .paidAmount(paidAmount)
                    .pendingAmount(pendingAmount)
                    .isOverdue(isOverdue)
                    .paymentScheduleType(paymentScheduleType)
                    .build();

            studentDetails.add(detail);

            if (pendingAmount <= 0)
                completePaymentCount++;
            if (pendingAmount > 0)
                pendingPaymentCount++;
            if (isOverdue)
                overduePaymentCount++;
        }

        return ClassSectionFeeReport.builder()
                .grade(grade)
                .section(section)
                .academicYear(getCurrentFinancialYear() + "-" + (getCurrentFinancialYear() + 1))
                .totalFeesCharged(totalFeesCharged)
                .totalCollected(totalCollected)
                .totalPending(totalPending)
                .totalOverdue(calculateTotalOverdue(LocalDate.now()))
                .totalStudents(students.size())
                .studentsWithCompletePayment(completePaymentCount)
                .studentsWithPendingPayment(pendingPaymentCount)
                .studentsWithOverduePayment(overduePaymentCount)
                .feeTypeDistribution(feeTypeDistribution)
                .studentDetails(studentDetails)
                .build();
    }

    public List<ClassSectionFeeReport> generateAggregateReports() {
        Map<String, List<Student>> studentsByClassSection = studentService.getAllStudents().stream()
                .collect(Collectors.groupingBy(s -> s.getGrade() + "-" + s.getSection()));

        List<ClassSectionFeeReport> reports = new ArrayList<>();

        for (String classSection : studentsByClassSection.keySet()) {
            String[] parts = classSection.split("-");
            Integer grade = Integer.parseInt(parts[0]);
            String section = parts.length > 1 ? parts[1] : "A";

            ClassSectionFeeReport report = generateClassSectionReport(grade, section);
            reports.add(report);
        }

        return reports;
    }

    // Reports CSV generation
    public byte[] generateClassSectionReportCsv(Integer grade, String section, Integer month, Integer year) {
        java.time.LocalDate start;
        java.time.LocalDate end;
        if (month != null && year != null) {
            start = java.time.LocalDate.of(year, month, 1);
            end = start.withDayOfMonth(start.lengthOfMonth());
        } else if (year != null) {
            start = java.time.LocalDate.of(year, 1, 1);
            end = java.time.LocalDate.of(year, 12, 31);
        } else {
            // default to current month
            start = java.time.LocalDate.now().withDayOfMonth(1);
            end = start.withDayOfMonth(start.lengthOfMonth());
        }
        List<Payment> payments = paymentRepository.findByClassSectionAndDateRange(
                grade, section, start.atStartOfDay(), end.atTime(23, 59, 59));
        StringBuilder sb = new StringBuilder();
        sb.append("Receipt,Date,StudentId,StudentName,Class,Section,Amount,Method,Status\n");
        java.time.format.DateTimeFormatter df = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (Payment p : payments) {
            Student s = p.getStudent();
            String studentName = (Optional.ofNullable(s.getFirstName()).orElse("") + " "
                    + Optional.ofNullable(s.getLastName()).orElse("")).trim();
            sb.append(Optional.ofNullable(p.getReceiptNumber()).orElse("R" + String.format("%06d", p.getId())))
                    .append(',')
                    .append(p.getPaymentDate() != null ? p.getPaymentDate().toLocalDate().format(df) : "").append(',')
                    .append(s.getId()).append(',')
                    .append(escapeCsv(studentName)).append(',')
                    .append(s.getGrade() != null ? s.getGrade() : "").append(',')
                    .append(s.getSection() != null ? s.getSection() : "").append(',')
                    .append(String.format(java.util.Locale.ENGLISH, "%.2f",
                            Optional.ofNullable(p.getAmount()).orElse(0.0)))
                    .append(',')
                    .append(p.getPaymentMethod()).append(',')
                    .append(p.getStatus())
                    .append("\n");
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    public byte[] generateStudentReportCsv(Long studentId, Integer month, Integer year) {
        java.time.LocalDate start;
        java.time.LocalDate end;
        if (month != null && year != null) {
            start = java.time.LocalDate.of(year, month, 1);
            end = start.withDayOfMonth(start.lengthOfMonth());
        } else if (year != null) {
            start = java.time.LocalDate.of(year, 1, 1);
            end = java.time.LocalDate.of(year, 12, 31);
        } else {
            start = java.time.LocalDate.now().withDayOfMonth(1);
            end = start.withDayOfMonth(start.lengthOfMonth());
        }
        List<Payment> payments = paymentRepository.findByStudentAndDateRange(studentId, start.atStartOfDay(),
                end.atTime(23, 59, 59));
        StringBuilder sb = new StringBuilder();
        sb.append("Receipt,Date,Amount,Method,Status,Notes\n");
        java.time.format.DateTimeFormatter df = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (Payment p : payments) {
            sb.append(Optional.ofNullable(p.getReceiptNumber()).orElse("R" + String.format("%06d", p.getId())))
                    .append(',')
                    .append(p.getPaymentDate() != null ? p.getPaymentDate().toLocalDate().format(df) : "").append(',')
                    .append(String.format(java.util.Locale.ENGLISH, "%.2f",
                            Optional.ofNullable(p.getAmount()).orElse(0.0)))
                    .append(',')
                    .append(p.getPaymentMethod()).append(',')
                    .append(p.getStatus()).append(',')
                    .append(escapeCsv(Optional.ofNullable(p.getRemarks()).orElse("")))
                    .append("\n");
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private static String escapeCsv(String s) {
        if (s == null)
            return "";
        if (s.contains(",") || s.contains("\n") || s.contains("\r") || s.contains("\"")) {
            return '"' + s.replace("\"", "\"\"") + '"';
        }
        return s;
    }

    /**
     * Generates a report of students with fees due
     * 
     * @param classGrade Optional filter by class grade
     * @return List of FeePaymentSummary objects
     */
    public List<FeePaymentSummary> getFeesDueReport(Integer classGrade) {
        List<Student> students;
        if (classGrade != null) {
            students = studentService.getStudentsByGradeAndSection(classGrade, null);
        } else {
            students = studentService.getAllStudents();
        }

        List<FeePaymentSummary> result = new ArrayList<>();

        for (Student student : students) {
            List<Fee> applicableFees = getFeesByGrade(student.getGrade());
            double totalDue = applicableFees.stream().mapToDouble(Fee::getAmount).sum();

            List<Payment> studentPayments = getStudentPayments(student.getId());
            double totalPaid = studentPayments.stream()
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                    .mapToDouble(Payment::getAmount).sum();

            double balance = totalDue - totalPaid;

            // Only include students with unpaid fees
            if (balance > 0) {
                FeePaymentSummary summary = createReportSummary(student, totalDue, totalPaid, balance);
                result.add(summary);
            }
        }

        return result;
    }

    /**
     * Generates a report of fee payment status for all students
     * 
     * @param classGrade Optional filter by class grade
     * @return List of FeePaymentSummary objects
     */
    public List<FeePaymentSummary> getFeeStatusReport(Integer classGrade) {
        List<Student> students;

        // Add detailed logging for debugging
        log.debug("Generating fee status report for class grade: {}", classGrade);
        if (classGrade != null) {
            students = studentService.getStudentsByGradeAndSection(classGrade, null);
            log.debug("Found {} students in grade {}", students.size(), classGrade);

            // Generic handling for all grades when no students found directly
            if (students.isEmpty()) {
                log.warn("No students found for Grade {}. Checking for alternatives...", classGrade);
                List<Student> allStudents = studentService.getAllStudents();

                // Check for students with null grades that could be included in this grade
                List<Student> studentsWithoutGrade = allStudents.stream()
                        .filter(s -> s.getGrade() == null)
                        .collect(Collectors.toList());

                if (!studentsWithoutGrade.isEmpty()) {
                    log.info("Found {} students with null grade. Including these in Grade {}.",
                            studentsWithoutGrade.size(), classGrade);
                    students = studentsWithoutGrade;
                }

                // If still empty, look for students whose grade might be incorrectly set
                // Consider students from adjacent grades (grade-1, grade+1) as potential
                // matches
                if (students.isEmpty()) {
                    List<Student> potentialGradeStudents = allStudents.stream()
                            .filter(s -> s.getGrade() != null &&
                                    (s.getGrade() == classGrade ||
                                            s.getGrade() == classGrade - 1 ||
                                            s.getGrade() == classGrade + 1))
                            .collect(Collectors.toList());

                    if (!potentialGradeStudents.isEmpty()) {
                        log.info(
                                "Found {} students that could potentially be in Grade {}. Including these in the report.",
                                potentialGradeStudents.size(), classGrade);
                        students = potentialGradeStudents;
                    }
                }
            }
        } else {
            students = studentService.getAllStudents();
            log.debug("Fetched all students: {}", students.size());
        }

        // If no students found for specified grade, log the issue
        if (students.isEmpty() && classGrade != null) {
            log.warn("No students found for grade {}", classGrade);
        }

        List<FeePaymentSummary> result = new ArrayList<>();
        for (Student student : students) { // Handle the case where a student's grade might be null
            Integer studentGrade = student.getGrade();
            // If student's grade is null, handle according to requested classGrade
            // or default to what makes sense for the student
            if (studentGrade == null) {
                if (classGrade != null) {
                    // If we're looking for a specific grade and the student's grade is null,
                    // treat them as being in the requested grade for this report
                    studentGrade = classGrade;
                    log.debug("Student {} has null grade, treating as Grade {} as requested in the report filter",
                            student.getId(), classGrade);
                } else {
                    // Default logic - use a sensible default grade or estimate based on age
                    // For now we'll calculate based on average age for each grade
                    // This could be enhanced with more sophisticated logic
                    int estimatedGrade = estimateGradeFromStudentAge(student);
                    studentGrade = estimatedGrade;
                    log.debug("Student {} has null grade, estimating as Grade {} based on available data",
                            student.getId(), studentGrade);
                }
            }

            log.debug("Processing student: {} - {} {} (Grade: {})", student.getId(), student.getFirstName(),
                    student.getLastName(), studentGrade);

            List<Fee> applicableFees = getFeesByGrade(studentGrade);
            log.debug("Found {} applicable fees for grade {}", applicableFees.size(), studentGrade);
            // If no fees found for the student's grade, try to create default fees for any
            // grade
            if (applicableFees.isEmpty() && studentGrade != null) {
                log.info("No fees found for Grade {}, attempting to use default fees", classGrade);
                List<Fee> allFees = feeRepository.findAll();
                if (!allFees.isEmpty()) {
                    Fee templateFee = allFees.get(0);
                    Fee defaultFee = new Fee();
                    defaultFee.setName("Tuition Fee - Grade " + classGrade);
                    defaultFee.setGrade(classGrade);
                    defaultFee.setAmount(templateFee.getAmount());
                    defaultFee.setDueDate(LocalDate.now().plusMonths(1));
                    defaultFee.setFeeType(Fee.FeeType.TUITION);
                    defaultFee.setFrequency(Fee.FeeFrequency.MONTHLY);
                    defaultFee.setDescription("Default tuition fee for Grade " + classGrade);

                    Fee savedFee = feeRepository.save(defaultFee);
                    applicableFees = List.of(savedFee);
                    log.info("Created default fee for Grade {}: {}", classGrade, savedFee.getId());
                }
            }

            double totalDue = applicableFees.stream().mapToDouble(Fee::getAmount).sum();
            log.debug("Total due amount: {}", totalDue);

            List<Payment> studentPayments = getStudentPayments(student.getId());
            double totalPaid = studentPayments.stream()
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                    .mapToDouble(Payment::getAmount).sum();

            double balance = totalDue - totalPaid;
            log.debug("Balance: {} (Total due: {} - Total paid: {})", balance, totalDue, totalPaid);

            FeePaymentSummary summary = createReportSummary(student, totalDue, totalPaid, balance);
            result.add(summary);
        }

        log.debug("Returning {} fee payment summaries", result.size());
        return result;
    }

    /**
     * Helper method to create a FeePaymentSummary object for reports
     */
    private FeePaymentSummary createReportSummary(Student student, double totalDue, double totalPaid, double balance) {
        Payment.PaymentStatus paymentStatus;

        // Determine payment status based on balance and payments
        if (balance <= 0) {
            paymentStatus = Payment.PaymentStatus.COMPLETED;
        } else if (totalPaid > 0) {
            paymentStatus = Payment.PaymentStatus.PENDING; // Partially paid
        } else {
            paymentStatus = Payment.PaymentStatus.PENDING; // Not paid at all
        }

        // Check if payment is overdue
        List<Fee> overdueFees = feeRepository.findByGradeAndDueDateBefore(
                student.getGrade(), LocalDate.now());

        boolean isOverdue = !overdueFees.isEmpty() && balance > 0;

        if (isOverdue) {
            // We'll keep using PENDING status for overdue payments
            // Consider adding an OVERDUE status to the PaymentStatus enum if needed
            paymentStatus = Payment.PaymentStatus.PENDING;
        }
        // Get last payment date and next due date
        List<Payment> studentPayments = getStudentPayments(student.getId());
        String lastPaymentDate = studentPayments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .max(Comparator.comparing(Payment::getPaymentDate))
                .map(p -> p.getPaymentDate().toString())
                .orElse(null);

        List<Fee> upcomingFees = feeRepository.findByGradeAndDueDateAfterOrderByDueDate(
                student.getGrade(), LocalDate.now());
        String nextDueDate = upcomingFees.stream()
                .findFirst()
                .map(f -> f.getDueDate().toString())
                .orElse(null);

        // Explicitly construct student name, ensuring no null values
        String firstName = student.getFirstName() != null ? student.getFirstName() : "";
        String lastName = student.getLastName() != null ? student.getLastName() : "";
        String studentFullName = (firstName + " " + lastName).trim();
        if (studentFullName.isEmpty()) {
            studentFullName = "Student #" + student.getId();
        }

        return FeePaymentSummary.builder()
                .studentId(student.getId())
                .studentName(studentFullName) // Use the dedicated studentName field
                .feeName(studentFullName) // Keep feeName for backward compatibility
                .totalAmount(totalDue)
                .paidAmount(totalPaid)
                .remainingAmount(balance)
                .status(paymentStatus)
                .lastPaymentDate(lastPaymentDate)
                .nextDueDate(nextDueDate)
                .dueDate(nextDueDate != null ? LocalDate.parse(nextDueDate) : null)
                .isOverdue(isOverdue)
                .build();
    }

    /**
     * Generates an Excel report for fee data
     * 
     * @param reportType The type of report to generate
     * @param classGrade Optional filter by class grade
     * @return Byte array containing the Excel file data
     */
    public byte[] generateReportExcel(String reportType, Integer classGrade) {
        List<FeePaymentSummary> data;

        if ("students-with-fees-due".equals(reportType)) {
            data = getFeesDueReport(classGrade);
        } else if ("fee-payment-status".equals(reportType)) {
            data = getFeeStatusReport(classGrade);
        } else {
            throw new IllegalArgumentException("Invalid report type: " + reportType);
        }

        // In a real implementation, you would use a library like Apache POI to generate
        // Excel
        // This is a simplified version that just returns sample data
        String reportContent = "Report Type: " + reportType + "\n";
        if (classGrade != null) {
            reportContent += "Class Grade: " + classGrade + "\n";
        }
        reportContent += "Generated at: " + LocalDateTime.now() + "\n\n";

        for (FeePaymentSummary summary : data) {
            reportContent += String.format(
                    "Student: %s (ID: %d), Total Due: $%.2f, Total Paid: $%.2f, Balance: $%.2f, Status: %s\n",
                    summary.getFeeName(),
                    summary.getStudentId(),
                    summary.getTotalAmount(),
                    summary.getPaidAmount(),
                    summary.getRemainingAmount(),
                    summary.getStatus());
        }

        return reportContent.getBytes();
    }

    private FeePaymentSummary createFeeSummary(Fee fee, List<Payment> payments) {
        Double paidAmount = payments.stream()
                .filter(p -> p.getFee().getId().equals(fee.getId()))
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .mapToDouble(Payment::getAmount)
                .sum();

        Double remainingAmount = fee.getAmount() - paidAmount;
        boolean isOverdue = fee.getDueDate().isBefore(LocalDate.now()) && remainingAmount > 0;
        Double lateCharges = isOverdue ? calculateLateCharges(fee, remainingAmount) : 0.0;

        return FeePaymentSummary.builder()
                .feeId(fee.getId())
                .feeName(fee.getName())
                .totalAmount(fee.getAmount())
                .paidAmount(paidAmount)
                .remainingAmount(remainingAmount)
                .dueDate(fee.getDueDate())
                .status(determinePaymentStatus(paidAmount, fee.getAmount(), isOverdue))
                .latePaymentCharges(lateCharges)
                .isOverdue(isOverdue)
                .build();
    }

    private Payment.PaymentStatus determinePaymentStatus(Double paid, Double total, boolean isOverdue) {
        if (paid.equals(total)) {
            return Payment.PaymentStatus.COMPLETED;
        }
        if (isOverdue) {
            return Payment.PaymentStatus.PENDING;
        }
        return paid > 0 ? Payment.PaymentStatus.PENDING : Payment.PaymentStatus.PENDING;
    }

    private Double calculateLateCharges(Fee fee, Double remainingAmount) {
        long monthsLate = ChronoUnit.MONTHS.between(fee.getDueDate(), LocalDate.now());
        return remainingAmount * 0.02 * monthsLate;
    }

    private LocalDate getSemesterStartDate(Integer year, String semester) {
        return semester.equalsIgnoreCase("SPRING") ? LocalDate.of(year, 1, 1) : LocalDate.of(year, 7, 1);
    }

    private LocalDate getSemesterEndDate(Integer year, String semester) {
        return semester.equalsIgnoreCase("SPRING") ? LocalDate.of(year, 6, 30) : LocalDate.of(year, 12, 31);
    }

    private Double calculateTotalFeesCharged(LocalDate startDate, LocalDate endDate) {
        return feeRepository.findByDueDateBetween(startDate, endDate).stream()
                .mapToDouble(Fee::getAmount)
                .sum();
    }

    private Double calculateTotalCollected(List<Payment> payments) {
        return payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    private Double calculateTotalPending(LocalDate startDate, LocalDate endDate) {
        Double charged = calculateTotalFeesCharged(startDate, endDate);
        Double collected = calculateTotalCollected(
                paymentRepository.findByPaymentDateBetween(startDate.atStartOfDay(), endDate.atTime(23, 59, 59)));
        return charged - collected;
    }

    private Double calculateTotalOverdue(LocalDate date) {
        List<Fee> overdueFees = feeRepository.findByDueDateBefore(date);
        return overdueFees.stream()
                .mapToDouble(fee -> {
                    Double paid = paymentRepository.findByFeeId(fee.getId()).stream()
                            .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                            .mapToDouble(Payment::getAmount)
                            .sum();
                    return fee.getAmount() - paid;
                })
                .sum();
    }

    private int calculateTotalStudents() {
        return (int) studentService.getAllStudents().size();
    }

    private int calculateStudentsWithDues(LocalDate date) {
        List<Fee> overdueFees = feeRepository.findByDueDateBefore(date);
        Set<Long> studentsWithDues = new HashSet<>();

        overdueFees.forEach(fee -> {
            List<Payment> payments = paymentRepository.findByFeeId(fee.getId());
            Double paidAmount = payments.stream()
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                    .mapToDouble(Payment::getAmount)
                    .sum();

            if (paidAmount < fee.getAmount()) {
                payments.forEach(p -> studentsWithDues.add(p.getStudent().getId()));
            }
        });

        return studentsWithDues.size();
    }

    private Map<String, Double> calculateFeeTypeDistribution(List<Payment> payments) {
        Map<String, Double> distribution = new HashMap<>();

        Map<Long, Fee> feeMap = new HashMap<>();
        payments.forEach(p -> {
            if (!feeMap.containsKey(p.getFee().getId())) {
                feeMap.put(p.getFee().getId(), p.getFee());
            }

            String feeType = p.getFee().getFeeType().toString();
            distribution.put(
                    feeType,
                    distribution.getOrDefault(feeType, 0.0) + p.getAmount());
        });

        return distribution;
    }

    private Map<String, Double> calculatePaymentMethodDistribution(List<Payment> payments) {
        Map<String, Double> distribution = new HashMap<>();

        payments.forEach(p -> {
            String method = p.getPaymentMethod().toString();
            distribution.put(
                    method,
                    distribution.getOrDefault(method, 0.0) + p.getAmount());
        });

        return distribution;
    }

    private List<FeePaymentSummary> calculateGradewiseCollection(List<Payment> payments) {
        Map<Integer, Double> gradewiseAmounts = new HashMap<>();

        payments.forEach(p -> {
            int grade = p.getStudent().getGrade();
            gradewiseAmounts.put(
                    grade,
                    gradewiseAmounts.getOrDefault(grade, 0.0) + p.getAmount());
        });

        return gradewiseAmounts.entrySet().stream()
                .map(entry -> FeePaymentSummary.builder()
                        .feeName("Grade " + entry.getKey())
                        .totalAmount(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private void sendPaymentConfirmationEmail(Student student, Payment payment) {
        String message = String.format(
                "Dear %s %s,\n\nYour payment of %.2f for %s has been received successfully. " +
                        "Payment reference: %s\n\nThank you for your prompt payment.",
                student.getFirstName(),
                student.getLastName(),
                payment.getAmount(),
                payment.getFee().getName(),
                payment.getTransactionReference() != null ? payment.getTransactionReference()
                        : payment.getId().toString());

        notificationService.sendEmail(
                student.getEmail(),
                "Payment Confirmation - " + payment.getFee().getName(),
                message);
    }

    private int getCurrentFinancialYear() {
        LocalDate today = LocalDate.now();
        if (today.getMonthValue() >= Month.APRIL.getValue()) {
            return today.getYear();
        } else {
            return today.getYear() - 1;
        }
    }

    /**
     * Estimates a student's grade based on available data such as age, enrollment
     * date, etc.
     * This is a fallback method when grade data is missing
     * 
     * @param student The student to estimate grade for
     * @return The estimated grade level (1-12 typically)
     */
    private int estimateGradeFromStudentAge(Student student) {
        // Default to Grade 1 if we can't make a better estimate
        int estimatedGrade = 1;

        try {
            // If we have date of birth, we can estimate based on age
            if (student.getDateOfBirth() != null) {
                LocalDate today = LocalDate.now();
                int age = Period.between(student.getDateOfBirth(), today).getYears();

                // Roughly estimate grade by age: most 6-year-olds are in Grade 1,
                // 7-year-olds in Grade 2, etc.
                estimatedGrade = Math.max(1, age - 5);

                // Cap at reasonable maximum grade
                estimatedGrade = Math.min(estimatedGrade, 12);
            }
            // If we have admission date, we can refine the estimate
            if (student.getAdmissionDate() != null) {
                LocalDate admissionDate = student.getAdmissionDate();
                long yearsEnrolled = ChronoUnit.YEARS.between(admissionDate, LocalDate.now());

                // If the student was enrolled in Grade 1, add years enrolled to get current
                // grade
                // This assumes no grade repetition
                int enrollmentBasedGrade = (int) yearsEnrolled + 1;

                // If we have both age and enrollment estimates, use the more conservative one
                if (student.getDateOfBirth() != null) {
                    estimatedGrade = Math.min(estimatedGrade, enrollmentBasedGrade);
                } else {
                    estimatedGrade = enrollmentBasedGrade;
                }
            }
        } catch (Exception e) {
            // If any errors in calculation, fall back to Grade 1
            log.error("Error estimating grade for student {}: {}", student.getId(), e.getMessage(), e);
            estimatedGrade = 1;
        }

        return estimatedGrade;
    }

    /**
     * Backward compatible filtered payments API.
     */
    public List<Payment> getFilteredPayments(Integer grade, String section, String studentName) {
        return getFilteredPayments(grade, section, studentName, null, null, null, null, null, null);
    }

    /**
     * Extended filtered payments with date range, status, payment method, and amount range.
     */
    public List<Payment> getFilteredPayments(
            Integer grade,
            String section,
            String studentName,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate,
            String status,
            String method,
            Double minAmount,
            Double maxAmount) {
        log.debug("Filtering payments - grade={}, section={}, studentName={}, start={}, end={}, status={}, method={}, minAmount={}, maxAmount={}",
                grade, section, studentName, startDate, endDate, status, method, minAmount, maxAmount);

        java.time.LocalDateTime start = startDate != null ? startDate.atStartOfDay() : null;
        java.time.LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : null;

        Payment.PaymentStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = Payment.PaymentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignore) {
                log.warn("Unknown payment status filter: {}", status);
            }
        }
        Payment.PaymentMethod methodEnum = null;
        if (method != null && !method.isBlank()) {
            try {
                methodEnum = Payment.PaymentMethod.valueOf(method.toUpperCase());
            } catch (IllegalArgumentException ignore) {
                log.warn("Unknown payment method filter: {}", method);
            }
        }

        return paymentRepository.findFilteredPayments(
                grade, section, studentName, start, end, statusEnum, methodEnum, minAmount, maxAmount);
    }
}