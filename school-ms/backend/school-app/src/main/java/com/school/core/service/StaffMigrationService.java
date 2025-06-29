package com.school.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.school.core.model.Staff;
import com.school.core.repository.StaffRepository;
import com.school.staff.adapter.StaffEntityAdapter;
// Import the repositories with fully qualified names in the code
import com.school.staff.model.ConsolidatedStaff;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service to handle the migration of staff data from legacy entities to the consolidated Staff entity.
 */
@Service
public class StaffMigrationService {
    private static final Logger log = LoggerFactory.getLogger(StaffMigrationService.class);
    
    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private StaffEntityAdapter staffAdapter;

    // Legacy repositories are no longer available after migration
    // @Autowired
    // private com.school.hrm.repository.StaffRepository hrmStaffRepository;

    @Autowired
    private com.school.staff.repository.StaffRepository staffModelRepository;

    /**
     * Migrates all staff data from legacy entities to the consolidated Staff entity.
     * This method should be called only once during application startup or via a migration script.
     * 
     * @return The number of staff records migrated
     */    @Transactional
    public int migrateAllStaffData() {
        log.info("Starting staff data migration from legacy entities to consolidated entity");
        int migrationCount = 0;
        
        // HRM Staff migration is no longer needed as the package has been removed
        log.info("Skipping HRM staff migration as the package has been removed");
        // Migrate from Staff Model
        int staffModelCount = 0;
        List<com.school.staff.model.Staff> staffModelList = staffModelRepository.findAll();
        for (com.school.staff.model.Staff modelStaff : staffModelList) {
            try {
                Staff staff = staffAdapter.fromLegacyStaff(modelStaff);
                Optional<Staff> existingStaff = staffRepository.findByStaffId(modelStaff.getStaffId());
                
                if (existingStaff.isPresent()) {
                    Staff updated = staffAdapter.updateFromLegacyStaff(existingStaff.get(), modelStaff);
                    staffRepository.save(updated);
                } else {
                    staffRepository.save(staff);
                }
                
                staffModelCount++;
            } catch (Exception e) {
                log.error("Error migrating Staff Model with ID {}: {}", modelStaff.getId(), e.getMessage(), e);
            }
        }
        
        log.info("Migrated {} Staff Model records", staffModelCount);
        
        return migrationCount + staffModelCount;
    }
      /**
     * Checks if all staff data has been migrated to the consolidated Staff entity.
     * 
     * @return true if all data has been migrated, false otherwise
     */
    public boolean isMigrationComplete() {
        // HRM repository no longer exists
        long staffModelCount = staffModelRepository.count();
        long consolidatedCount = staffRepository.count();
        
        return consolidatedCount >= staffModelCount;
    }
      /**
     * Gets the migration status.
     * 
     * @return A string with the migration status
     */
    public String getMigrationStatus() {
        // HRM repository no longer exists
        long staffModelCount = staffModelRepository.count();
        long consolidatedCount = staffRepository.count();
        
        return String.format("Migration status: %d/%d records migrated (Staff Model: %d)",
                consolidatedCount, staffModelCount, staffModelCount);
    }
}
