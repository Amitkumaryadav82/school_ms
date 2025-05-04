package com.school.hrm.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.school.hrm.entity.StaffDesignation;

@Repository
public interface StaffDesignationRepository extends JpaRepository<StaffDesignation, Long> {

    Optional<StaffDesignation> findByName(String name);

    boolean existsByName(String name);
}