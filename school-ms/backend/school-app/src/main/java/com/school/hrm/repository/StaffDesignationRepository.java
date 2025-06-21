package com.school.hrm.repository;

import com.school.hrm.entity.StaffDesignation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @deprecated This repository is being phased out in favor of the consolidated StaffRepository in the core package.
 * This interface is kept for backward compatibility during the migration process.
 */
@Deprecated
@Repository
public interface StaffDesignationRepository extends JpaRepository<StaffDesignation, Long> {
    
    Optional<StaffDesignation> findByName(String name);
    
    boolean existsByName(String name);
}
