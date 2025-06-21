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
 * Entity representing a staff role in the HRM module.
 * 
 * @deprecated This class is deprecated in favor of com.school.core.model.StaffRole.
 * Please use the consolidated entity as part of the entity consolidation effort.
 * See PACKAGE-MIGRATION-PLAN.md for more details.
 */
@Entity(name = "HrmStaffRole")
@Table(name = "hrm_staff_roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Deprecated
public class StaffRole {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String roleName;
    
    private String description;
    
    private Boolean isActive;
}
