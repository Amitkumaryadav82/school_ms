package com.school.exam.model;

import javax.persistence.*;

@Entity
@Table(name = "exam_configs")
public class ExamConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "max_marks")
    private Integer maxMarks;

    @Column(name = "theory_marks")
    private Integer theoryMarks;

    @Column(name = "practical_marks")
    private Integer practicalMarks;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SchoolClass getSchoolClass() { return schoolClass; }
    public void setSchoolClass(SchoolClass schoolClass) { this.schoolClass = schoolClass; }
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    public Integer getMaxMarks() { return maxMarks; }
    public void setMaxMarks(Integer maxMarks) { this.maxMarks = maxMarks; }
    public Integer getTheoryMarks() { return theoryMarks; }
    public void setTheoryMarks(Integer theoryMarks) { this.theoryMarks = theoryMarks; }
    public Integer getPracticalMarks() { return practicalMarks; }
    public void setPracticalMarks(Integer practicalMarks) { this.practicalMarks = practicalMarks; }
}
