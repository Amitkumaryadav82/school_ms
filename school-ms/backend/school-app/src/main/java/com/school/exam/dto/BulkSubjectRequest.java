package com.school.exam.dto;

import com.school.exam.model.Subject;
import lombok.Data;
import javax.validation.Valid;
import java.util.List;

@Data
public class BulkSubjectRequest {
    @Valid
    private List<Subject> subjects;
    private Integer expectedCount;

    public List<Subject> getSubjects() {
        return subjects;
    }
    public Integer getExpectedCount() {
        return expectedCount;
    }
}
