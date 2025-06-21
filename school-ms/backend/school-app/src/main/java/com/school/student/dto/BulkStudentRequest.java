package com.school.student.dto;

import com.school.student.model.Student;
import lombok.Data;
import javax.validation.Valid;
import java.util.List;

@Data
public class BulkStudentRequest {
    @Valid
    private List<Student> students;

    // Summary information for validation
    private Integer expectedCount;
    
    /**
     * Gets the list of students
     * @return the list of students
     */
    public List<Student> getStudents() {
        return students;
    }
    
    /**
     * Gets the expected count
     * @return the expected count
     */
    public Integer getExpectedCount() {
        return expectedCount;
    }
}
