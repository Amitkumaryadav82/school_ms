package com.school.student.dto;

import com.school.student.model.Student;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import javax.validation.Valid;
import java.util.List;

@Getter
@Setter
public class BulkStudentRequest {
    @Valid
    private List<Student> students;

    // Summary information for validation
    private Integer expectedCount;

    // Explicit getters and setters in case Lombok fails
    public List<Student> getStudents() {
        return this.students;
    }
    
    public void setStudents(List<Student> students) {
        this.students = students;
    }
    
    public Integer getExpectedCount() {
        return this.expectedCount;
    }
    
    public void setExpectedCount(Integer expectedCount) {
        this.expectedCount = expectedCount;
    }
}
