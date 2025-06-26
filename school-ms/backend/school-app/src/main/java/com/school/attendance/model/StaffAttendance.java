package com.school.attendance.model;

import com.school.common.model.Auditable;
import com.school.core.model.Staff;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "staff_attendance", uniqueConstraints = @UniqueConstraint(columnNames = { "staff_id", "attendance_date" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffAttendance extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @NotNull
    @Column(name = "attendance_date")
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "status")
    private StaffAttendanceStatus status;

    @Column(name = "note")
    private String note;
}
