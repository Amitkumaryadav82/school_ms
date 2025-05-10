package com.school.fee.repository;

import com.school.fee.model.FeeStructure;
import com.school.fee.model.StudentFeeAssignment;
import com.school.student.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentFeeAssignmentRepository extends JpaRepository<StudentFeeAssignment, Long> {
    List<StudentFeeAssignment> findByStudent(Student student);

    List<StudentFeeAssignment> findByStudentAndIsActiveTrue(Student student);

    List<StudentFeeAssignment> findByFeeStructureAndIsActiveTrue(FeeStructure feeStructure);

    Optional<StudentFeeAssignment> findByStudentAndIsActiveTrueAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqual(
            Student student, LocalDate currentDate1, LocalDate currentDate2);
}