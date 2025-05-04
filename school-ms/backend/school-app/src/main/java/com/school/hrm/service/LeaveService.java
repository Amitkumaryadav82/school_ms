package com.school.hrm.service;

import com.school.hrm.model.Employee;
import com.school.hrm.model.Leave;
import com.school.hrm.model.LeaveStatus;
import com.school.hrm.repository.LeaveRepository;
import com.school.hrm.repository.EmployeeRepository;
import com.school.hrm.dto.LeaveDTO;
import com.school.hrm.exception.LeaveNotFoundException;
import com.school.hrm.exception.EmployeeNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class LeaveService {
        private final LeaveRepository leaveRepository;
        private final EmployeeRepository employeeRepository;

        public LeaveDTO applyForLeave(LeaveDTO leaveDTO) {
                // Check if employee exists
                Employee employee = employeeRepository.findById(leaveDTO.getEmployeeId())
                                .orElseThrow(() -> new EmployeeNotFoundException(leaveDTO.getEmployeeId()));

                // Check for overlapping approved leaves
                if (hasOverlappingLeave(leaveDTO.getEmployeeId(), leaveDTO.getStartDate(), leaveDTO.getEndDate())) {
                        throw new IllegalArgumentException("Employee already has approved leave during this period");
                }

                Leave leave = Leave.builder()
                                .employee(employee)
                                .type(leaveDTO.getType())
                                .startDate(leaveDTO.getStartDate())
                                .endDate(leaveDTO.getEndDate())
                                .reason(leaveDTO.getReason())
                                .status(LeaveStatus.PENDING)
                                .build();

                Leave savedLeave = leaveRepository.save(leave);
                return convertToDTO(savedLeave);
        }

        public LeaveDTO processLeaveRequest(Long leaveId, LeaveStatus status, String comments, Long approvedById) {
                Leave leave = leaveRepository.findById(leaveId)
                                .orElseThrow(() -> new LeaveNotFoundException(leaveId));

                Employee approver = employeeRepository.findById(approvedById)
                                .orElseThrow(() -> new EmployeeNotFoundException(approvedById));

                leave.setStatus(status);
                leave.setComments(comments);
                leave.setApprovedBy(approver);
                leave.setApprovalDate(LocalDate.now());

                Leave updatedLeave = leaveRepository.save(leave);
                return convertToDTO(updatedLeave);
        }

        public LeaveDTO getLeave(Long id) {
                Leave leave = leaveRepository.findById(id)
                                .orElseThrow(() -> new LeaveNotFoundException(id));
                return convertToDTO(leave);
        }

        public List<LeaveDTO> getEmployeeLeaves(Long employeeId) {
                if (!employeeRepository.existsById(employeeId)) {
                        throw new EmployeeNotFoundException(employeeId);
                }
                return leaveRepository.findByEmployeeId(employeeId).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<LeaveDTO> getPendingLeaves() {
                return leaveRepository.findByStatus(LeaveStatus.PENDING).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<LeaveDTO> getLeavesByDateRange(LocalDate startDate, LocalDate endDate) {
                return leaveRepository.findByStartDateBetween(startDate, endDate).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        private boolean hasOverlappingLeave(Long employeeId, LocalDate startDate, LocalDate endDate) {
                return leaveRepository
                                .existsByEmployeeIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                                employeeId, LeaveStatus.APPROVED, endDate, startDate);
        }

        private LeaveDTO convertToDTO(Leave leave) {
                return LeaveDTO.builder()
                                .id(leave.getId())
                                .employeeId(leave.getEmployee().getId())
                                .employeeName(leave.getEmployee().getFirstName() + " "
                                                + leave.getEmployee().getLastName())
                                .type(leave.getType())
                                .startDate(leave.getStartDate())
                                .endDate(leave.getEndDate())
                                .reason(leave.getReason())
                                .status(leave.getStatus())
                                .comments(leave.getComments())
                                .approvedById(leave.getApprovedBy() != null ? leave.getApprovedBy().getId() : null)
                                .approvedByName(leave.getApprovedBy() != null ? leave.getApprovedBy().getFirstName()
                                                + " " + leave.getApprovedBy().getLastName() : null)
                                .approvalDate(leave.getApprovalDate())
                                .build();
        }
}