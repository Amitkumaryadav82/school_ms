package com.school.attendance.model;

import com.school.common.model.Auditable;
import com.school.student.model.Student;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.proxy.HibernateProxy;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance", uniqueConstraints = @UniqueConstraint(columnNames = { "student_id", "date" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    @NotNull
    private LocalDate date;

    private LocalTime checkInTime;

    private LocalTime checkOutTime;

    @Enumerated(EnumType.STRING)
    @NotNull
    private AttendanceStatus status;

    private String remarks;

    /**
     * Expose the student id without triggering lazy loading of the Student entity during JSON serialization.
     */
    @JsonProperty("studentId")
    public Long getStudentId() {
        if (student == null) return null;
        try {
            if (student instanceof HibernateProxy) {
                return (Long) ((HibernateProxy) student).getHibernateLazyInitializer().getIdentifier();
            }
        } catch (Exception ignored) {
            // Fallback to direct access
        }
        return student.getId();
    }
}
