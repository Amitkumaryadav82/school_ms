package com.school.fee.service;

import com.school.fee.model.Fee;
import com.school.fee.model.Payment;
import com.school.fee.repository.FeeRepository;
import com.school.fee.repository.PaymentRepository;
import com.school.fee.dto.FeeRequest;
import com.school.fee.dto.PaymentRequest;
import com.school.fee.dto.FeePaymentSummary;
import com.school.fee.dto.SemesterFeeReport;
import com.school.fee.exception.FeeNotFoundException;
import com.school.student.model.Student;
import com.school.student.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private StudentService studentService;

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
                .build();

        return paymentRepository.save(payment);
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
        // Calculate late payment charges based on business rules
        // For example: 2% of remaining amount per month
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
        return payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                        p -> p.getFee().getFeeType().name(),
                        Collectors.summingDouble(Payment::getAmount)));
    }

    private Map<String, Double> calculatePaymentMethodDistribution(List<Payment> payments) {
        return payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                        p -> p.getPaymentMethod().name(),
                        Collectors.summingDouble(Payment::getAmount)));
    }

    private List<FeePaymentSummary> calculateGradewiseCollection(List<Payment> payments) {
        Map<Integer, List<Payment>> gradewisePayments = payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .collect(Collectors.groupingBy(p -> p.getStudent().getGrade()));

        return gradewisePayments.entrySet().stream()
                .map(entry -> {
                    Double totalAmount = entry.getValue().stream()
                            .mapToDouble(Payment::getAmount)
                            .sum();

                    return FeePaymentSummary.builder()
                            .feeName("Grade " + entry.getKey())
                            .totalAmount(totalAmount)
                            .paidAmount(totalAmount)
                            .remainingAmount(0.0)
                            .status(Payment.PaymentStatus.COMPLETED)
                            .build();
                })
                .collect(Collectors.toList());
    }
}