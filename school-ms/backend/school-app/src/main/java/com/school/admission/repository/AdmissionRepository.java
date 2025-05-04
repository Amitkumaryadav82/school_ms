package com.school.admission.repository;

import com.school.admission.model.Admission;
import com.school.admission.model.Admission.AdmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, Long> {
    boolean existsByEmailAndStatus(String email, AdmissionStatus status);

    List<Admission> findByStatus(AdmissionStatus status);

    List<Admission> findByApplicantNameContainingIgnoreCase(String query);

    List<Admission> findByApplicationDateBetween(LocalDate startDate, LocalDate endDate);

    List<Admission> findByGradeApplying(Integer grade);
}