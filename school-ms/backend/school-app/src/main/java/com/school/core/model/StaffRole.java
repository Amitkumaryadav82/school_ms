package com.school.core.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a staff role.
 * Migrated from com.school.hrm.entity.StaffRole
 */
@Entity
@Table(name = "staff_roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffRole {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;    private String description;
      // Using Boolean object type so it can be null initially
    // Default is true for new records
    @javax.persistence.Column(name = "is_active", nullable = true)
    private Boolean isActive;
    
    /**
     * Get active status with null-safe handling
     * @return true if active, false otherwise
     */
    public boolean getIsActive() {
        return isActive != null ? isActive : true;
    }
    
    /**
     * Set active status
     * @param isActive active status
     */
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    /**
     * Get the role name - provided for backward compatibility with legacy code
     * @return the name of the role
     */
    public String getRoleName() {
        return this.name;
    }
}
