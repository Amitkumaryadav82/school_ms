package com.example.schoolms.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a staff member in the school
 */
@Entity(name = "ExampleStaff")
@Table(name = "example_staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String staffId;

    @Column(nullable = false)
    private String firstName;

    private String middleName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    private String phoneNumber;

    private String address;

    @Column(nullable = false)
    private String role;

    private LocalDate dateOfBirth;

    private LocalDate joiningDate;

    private String department;

    @Column(nullable = false)
    private boolean active = true;

    @OneToOne(cascade = CascadeType.ALL)
    private TeacherDetails teacherDetails;
}