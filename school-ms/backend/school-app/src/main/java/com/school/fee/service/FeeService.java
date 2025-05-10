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
        return feeRepository.findByGrade(grade);
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
}