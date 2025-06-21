package com.school.hrm.entity;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing a mapping between staff and designations.
 * 
 * @deprecated This class is deprecated.
 * Please use the consolidated entity structure as part of the entity consolidation effort.
 */
@Entity(name = "HrmStaffDesignationMapping")
@Table(name = "hrm_staff_designation_mappings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Deprecated
public class StaffDesignationMapping {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "designation_id", nullable = false)
    private StaffDesignation designation;
    
    private Boolean isPrimary = false;
    
    private Boolean isActive = true;
    
    @Column(name = "assigned_date")
    private LocalDate assignedDate;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;    // For easier repository queries - but mark as transient to avoid mapping conflicts
    @javax.persistence.Transient
    private Long staffId;
    
    // Make this transient as it's just a convenience field and would conflict
    // with the @JoinColumn mapping on the designation field
    @javax.persistence.Transient
    private Long designationId;
      /**
     * Gets the designation ID from the designation relationship
     * @return the designation ID or null if designation is null
     */
    public Long getDesignationId() {
        return designation != null ? designation.getId() : null;
    }

    /**
     * Gets the staff ID from the staff relationship
     * @return the staff ID or null if staff is null
     */
    public Long getStaffId() {
        return staff != null ? staff.getId() : null;
    }
}
