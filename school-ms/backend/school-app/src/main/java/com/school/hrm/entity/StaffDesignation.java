package com.school.hrm.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a staff designation in the HRM module.
 * 
 * @deprecated This class is deprecated in favor of com.school.core.model.StaffDesignation.
 * Please use the consolidated entity as part of the entity consolidation effort.
 */
@Entity(name = "HrmStaffDesignation")
@Table(name = "hrm_staff_designations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Deprecated
public class StaffDesignation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    private String description;
    
    private Boolean isActive;
}
