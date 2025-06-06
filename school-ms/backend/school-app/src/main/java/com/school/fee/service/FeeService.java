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
            System.out.println("No fees found for grade: " + grade);

            // Create default fee for any grade if none exists
            System.out.println("Creating default fee for Grade " + grade);
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
        Fee fee = getFee(request.getFeeId());
        Student student = studentService.getStudent(request.getStudentId());

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
                .receiptNumber(request.getReceiptNumber())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        sendPaymentConfirmationEmail(student, savedPayment);

        return savedPayment;
    }

    public List<Payment> getStudentPayments(Long studentId) {
        return paymentRepository.findByStudentId(studentId);
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
        System.out.println("Generating fee status report for class grade: " + classGrade);
        if (classGrade != null) {
            students = studentService.getStudentsByGradeAndSection(classGrade, null);
            System.out.println("Found " + students.size() + " students in grade " + classGrade);

            // Generic handling for all grades when no students found directly
            if (students.isEmpty()) {
                System.out.println("No students found for Grade " + classGrade + ". Checking for alternatives...");
                List<Student> allStudents = studentService.getAllStudents();

                // Check for students with null grades that could be included in this grade
                List<Student> studentsWithoutGrade = allStudents.stream()
                        .filter(s -> s.getGrade() == null)
                        .collect(Collectors.toList());

                if (!studentsWithoutGrade.isEmpty()) {
                    System.out.println("Found " + studentsWithoutGrade.size() +
                            " students with null grade. Including these in Grade " + classGrade + ".");
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
                        System.out.println("Found " + potentialGradeStudents.size() +
                                " students that could potentially be in Grade " + classGrade +
                                ". Including these in the report.");
                        students = potentialGradeStudents;
                    }
                }
            }
        } else {
            students = studentService.getAllStudents();
            System.out.println("Fetched all students: " + students.size());
        }

        // If no students found for specified grade, log the issue
        if (students.isEmpty() && classGrade != null) {
            System.out.println("WARNING: No students found for grade " + classGrade);
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
                    System.out.println("Student " + student.getId() + " has null grade, treating as Grade " +
                            classGrade + " as requested in the report filter");
                } else {
                    // Default logic - use a sensible default grade or estimate based on age
                    // For now we'll calculate based on average age for each grade
                    // This could be enhanced with more sophisticated logic
                    int estimatedGrade = estimateGradeFromStudentAge(student);
                    studentGrade = estimatedGrade;
                    System.out.println("Student " + student.getId() + " has null grade, estimating as Grade "
                            + studentGrade + " based on available data");
                }
            }

            System.out.println("Processing student: " + student.getId() + " - " + student.getFirstName() + " "
                    + student.getLastName() + " (Grade: " + studentGrade + ")");

            List<Fee> applicableFees = getFeesByGrade(studentGrade);
            System.out.println("Found " + applicableFees.size() + " applicable fees for grade " + studentGrade);
            // If no fees found for the student's grade, try to create default fees for any
            // grade
            if (applicableFees.isEmpty() && studentGrade != null) {
                System.out.println("No fees found for Grade " + classGrade + ", attempting to use default fees");
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
                    System.out.println("Created default fee for Grade " + classGrade + ": " + savedFee.getId());
                }
            }

            double totalDue = applicableFees.stream().mapToDouble(Fee::getAmount).sum();
            System.out.println("Total due amount: " + totalDue);

            List<Payment> studentPayments = getStudentPayments(student.getId());
            double totalPaid = studentPayments.stream()
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                    .mapToDouble(Payment::getAmount).sum();

            double balance = totalDue - totalPaid;
            System.out
                    .println("Balance: " + balance + " (Total due: " + totalDue + " - Total paid: " + totalPaid + ")");

            FeePaymentSummary summary = createReportSummary(student, totalDue, totalPaid, balance);
            result.add(summary);
        }

        System.out.println("Returning " + result.size() + " fee payment summaries");
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
            System.out.println("Error estimating grade for student " + student.getId() + ": " + e.getMessage());
            estimatedGrade = 1;
        }

        return estimatedGrade;
    }

    /**
     * Gets a filtered list of payments based on grade, section, and/or student name
     * 
     * @param grade       The grade to filter by (optional)
     * @param section     The section to filter by (optional)
     * @param studentName The student name to filter by (optional)
     * @return A filtered list of payments
     */
    public List<Payment> getFilteredPayments(Integer grade, String section, String studentName) {
        // Log the filter parameters for debugging
        System.out.println(
                "Filtering payments - Grade: " + grade + ", Section: " + section + ", Student Name: " + studentName);

        // Use the custom repository method for filtering
        return paymentRepository.findFilteredPayments(grade, section, studentName);
    }
}