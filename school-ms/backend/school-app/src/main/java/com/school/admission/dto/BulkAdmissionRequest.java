package com.school.admission.dto;

import com.school.admission.model.Admission;
import lombok.Data;
import javax.validation.Valid;
import java.util.List;

@Data
public class BulkAdmissionRequest {
    @Valid
    private List<AdmissionRequest> admissions;

    // Summary information for validation
    private Integer expectedCount;
    
    /**
     * Gets the list of admission applications
     * @return the list of admission applications
     */
    public List<AdmissionRequest> getAdmissions() {
        return admissions;
    }
    
    /**
     * Gets the expected count
     * @return the expected count
     */
    public Integer getExpectedCount() {
        return expectedCount;
    }
}
