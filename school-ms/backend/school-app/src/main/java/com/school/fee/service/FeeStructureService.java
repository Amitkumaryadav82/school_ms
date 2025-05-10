package com.school.fee.service;

import com.school.fee.dto.FeeStructureDTO;
import com.school.fee.dto.LateFeeDTO;
import com.school.fee.dto.PaymentScheduleDTO;
import com.school.fee.model.FeeStructure;
import com.school.fee.model.LateFee;
import com.school.fee.model.PaymentSchedule;
import com.school.fee.repository.FeeStructureRepository;
import com.school.fee.repository.LateFeeRepository;
import com.school.fee.repository.PaymentScheduleRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeStructureService {

    private final FeeStructureRepository feeStructureRepository;
    private final PaymentScheduleRepository paymentScheduleRepository;
    private final LateFeeRepository lateFeeRepository;

    public List<FeeStructureDTO> getAllFeeStructures() {
        return feeStructureRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public FeeStructureDTO getFeeStructureById(Long id) {
        FeeStructure feeStructure = feeStructureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fee Structure not found with id: " + id));
        return convertToDTO(feeStructure);
    }

    public FeeStructureDTO getFeeStructureByGrade(Integer classGrade) {
        FeeStructure feeStructure = feeStructureRepository.findByClassGrade(classGrade)
                .orElseThrow(() -> new EntityNotFoundException("Fee Structure not found for grade: " + classGrade));
        return convertToDTO(feeStructure);
    }

    @Transactional
    public FeeStructureDTO createFeeStructure(FeeStructureDTO feeStructureDTO) {
        if (feeStructureRepository.existsByClassGrade(feeStructureDTO.getClassGrade())) {
            throw new IllegalArgumentException(
                    "Fee structure for grade " + feeStructureDTO.getClassGrade() + " already exists");
        }

        FeeStructure feeStructure = new FeeStructure();
        feeStructure.setClassGrade(feeStructureDTO.getClassGrade());
        feeStructure.setAnnualFees(feeStructureDTO.getAnnualFees());
        feeStructure.setBuildingFees(feeStructureDTO.getBuildingFees());
        feeStructure.setLabFees(feeStructureDTO.getLabFees());

        FeeStructure savedFeeStructure = feeStructureRepository.save(feeStructure);

        // Create payment schedules if provided
        if (feeStructureDTO.getPaymentSchedules() != null && !feeStructureDTO.getPaymentSchedules().isEmpty()) {
            for (PaymentScheduleDTO scheduleDTO : feeStructureDTO.getPaymentSchedules()) {
                PaymentSchedule schedule = new PaymentSchedule();
                schedule.setFeeStructure(savedFeeStructure);
                schedule.setScheduleType(PaymentSchedule.ScheduleType.valueOf(scheduleDTO.getScheduleType()));
                schedule.setAmount(scheduleDTO.getAmount());
                schedule.setIsEnabled(scheduleDTO.getIsEnabled() != null ? scheduleDTO.getIsEnabled() : true);
                paymentScheduleRepository.save(schedule);
            }
        } else {
            // Create default payment schedules
            createDefaultPaymentSchedules(savedFeeStructure);
        }

        // Create late fees if provided
        if (feeStructureDTO.getLateFees() != null && !feeStructureDTO.getLateFees().isEmpty()) {
            for (LateFeeDTO lateFeeDTO : feeStructureDTO.getLateFees()) {
                LateFee lateFee = new LateFee();
                lateFee.setFeeStructure(savedFeeStructure);
                lateFee.setMonth(lateFeeDTO.getMonth());
                lateFee.setLateFeeAmount(lateFeeDTO.getLateFeeAmount());
                lateFee.setLateFeeDescription(lateFeeDTO.getLateFeeDescription());
                lateFee.setFineAmount(lateFeeDTO.getFineAmount());
                lateFee.setFineDescription(lateFeeDTO.getFineDescription());
                lateFeeRepository.save(lateFee);
            }
        }

        return convertToDTO(savedFeeStructure);
    }

    @Transactional
    public FeeStructureDTO updateFeeStructure(Long id, FeeStructureDTO feeStructureDTO) {
        FeeStructure existingFeeStructure = feeStructureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fee Structure not found with id: " + id));

        // Check if trying to update to an existing class grade
        if (!existingFeeStructure.getClassGrade().equals(feeStructureDTO.getClassGrade()) &&
                feeStructureRepository.existsByClassGrade(feeStructureDTO.getClassGrade())) {
            throw new IllegalArgumentException(
                    "Fee structure for grade " + feeStructureDTO.getClassGrade() + " already exists");
        }

        existingFeeStructure.setClassGrade(feeStructureDTO.getClassGrade());
        existingFeeStructure.setAnnualFees(feeStructureDTO.getAnnualFees());
        existingFeeStructure.setBuildingFees(feeStructureDTO.getBuildingFees());
        existingFeeStructure.setLabFees(feeStructureDTO.getLabFees());

        FeeStructure updatedFeeStructure = feeStructureRepository.save(existingFeeStructure);

        return convertToDTO(updatedFeeStructure);
    }

    @Transactional
    public void deleteFeeStructure(Long id) {
        if (!feeStructureRepository.existsById(id)) {
            throw new EntityNotFoundException("Fee Structure not found with id: " + id);
        }
        feeStructureRepository.deleteById(id);
    }

    private void createDefaultPaymentSchedules(FeeStructure feeStructure) {
        BigDecimal annualFee = feeStructure.getAnnualFees();

        // Monthly schedule (divide annual fee by 12)
        PaymentSchedule monthlySchedule = new PaymentSchedule();
        monthlySchedule.setFeeStructure(feeStructure);
        monthlySchedule.setScheduleType(PaymentSchedule.ScheduleType.MONTHLY);
        monthlySchedule.setAmount(annualFee.divide(BigDecimal.valueOf(12), 2, BigDecimal.ROUND_HALF_UP));
        monthlySchedule.setIsEnabled(true);
        paymentScheduleRepository.save(monthlySchedule);

        // Quarterly schedule (divide annual fee by 4)
        PaymentSchedule quarterlySchedule = new PaymentSchedule();
        quarterlySchedule.setFeeStructure(feeStructure);
        quarterlySchedule.setScheduleType(PaymentSchedule.ScheduleType.QUARTERLY);
        quarterlySchedule.setAmount(annualFee.divide(BigDecimal.valueOf(4), 2, BigDecimal.ROUND_HALF_UP));
        quarterlySchedule.setIsEnabled(true);
        paymentScheduleRepository.save(quarterlySchedule);

        // Yearly schedule (annual fee)
        PaymentSchedule yearlySchedule = new PaymentSchedule();
        yearlySchedule.setFeeStructure(feeStructure);
        yearlySchedule.setScheduleType(PaymentSchedule.ScheduleType.YEARLY);
        yearlySchedule.setAmount(annualFee);
        yearlySchedule.setIsEnabled(true);
        paymentScheduleRepository.save(yearlySchedule);
    }

    private FeeStructureDTO convertToDTO(FeeStructure feeStructure) {
        FeeStructureDTO dto = new FeeStructureDTO();
        dto.setId(feeStructure.getId());
        dto.setClassGrade(feeStructure.getClassGrade());
        dto.setAnnualFees(feeStructure.getAnnualFees());
        dto.setBuildingFees(feeStructure.getBuildingFees());
        dto.setLabFees(feeStructure.getLabFees());
        dto.setTotalFees(feeStructure.getTotalFees());

        // Load payment schedules
        List<PaymentSchedule> schedules = paymentScheduleRepository.findByFeeStructure(feeStructure);
        List<PaymentScheduleDTO> scheduleDTOs = new ArrayList<>();

        for (PaymentSchedule schedule : schedules) {
            PaymentScheduleDTO scheduleDTO = new PaymentScheduleDTO();
            scheduleDTO.setId(schedule.getId());
            scheduleDTO.setFeeStructureId(feeStructure.getId());
            scheduleDTO.setScheduleType(schedule.getScheduleType().name());
            scheduleDTO.setAmount(schedule.getAmount());
            scheduleDTO.setIsEnabled(schedule.getIsEnabled());
            scheduleDTOs.add(scheduleDTO);
        }
        dto.setPaymentSchedules(scheduleDTOs);

        // Load late fees
        List<LateFee> lateFees = lateFeeRepository.findByFeeStructure(feeStructure);
        List<LateFeeDTO> lateFeeDTOs = new ArrayList<>();

        for (LateFee lateFee : lateFees) {
            LateFeeDTO lateFeeDTO = new LateFeeDTO();
            lateFeeDTO.setId(lateFee.getId());
            lateFeeDTO.setFeeStructureId(feeStructure.getId());
            lateFeeDTO.setMonth(lateFee.getMonth());
            lateFeeDTO.setMonthName(Month.of(lateFee.getMonth()).name());
            lateFeeDTO.setLateFeeAmount(lateFee.getLateFeeAmount());
            lateFeeDTO.setLateFeeDescription(lateFee.getLateFeeDescription());
            lateFeeDTO.setFineAmount(lateFee.getFineAmount());
            lateFeeDTO.setFineDescription(lateFee.getFineDescription());
            lateFeeDTOs.add(lateFeeDTO);
        }
        dto.setLateFees(lateFeeDTOs);

        return dto;
    }
}