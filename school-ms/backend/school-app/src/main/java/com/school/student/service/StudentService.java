package com.school.student.service;

import com.school.student.model.Student;
import com.school.student.model.StudentStatus;
import com.school.student.repository.StudentRepository;
import com.school.student.exception.StudentNotFoundException;
import com.school.student.exception.DuplicateStudentException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public Student createStudent(Student student) {
        validateNewStudent(student);
        student.setAdmissionDate(LocalDate.now());
        return studentRepository.save(student);
    }

    public Student updateStudent(Long id, Student student) {
        if (!studentRepository.existsById(id)) {
            throw new StudentNotFoundException("Student not found with id: " + id);
        }
        validateExistingStudent(id, student);
        student.setId(id);
        return studentRepository.save(student);
    }

    public Student getStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with id: " + id));
    }

    public Student findByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with studentId: " + studentId));
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> searchStudents(String query) {
        return studentRepository.searchStudents(query);
    }

    public List<Student> getStudentsByGrade(Integer grade) {
        return studentRepository.findByGrade(grade);
    }

    public List<Student> getStudentsBySection(String section) {
        return studentRepository.findBySection(section);
    }

    public List<Student> getStudentsByGradeAndSection(Integer grade, String section) {
        return studentRepository.findByGradeAndSection(grade, section);
    }

    public List<Student> getStudentsByStatus(StudentStatus status) {
        return studentRepository.findByStatus(status);
    }

    public Student updateStudentStatus(Long id, StudentStatus status) {
        Student student = getStudent(id);
        student.setStatus(status);
        return studentRepository.save(student);
    }

    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new StudentNotFoundException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    private void validateNewStudent(Student student) {
        if (studentRepository.existsByStudentId(student.getStudentId())) {
            throw new DuplicateStudentException("Student ID already exists");
        }
        if (student.getEmail() != null && studentRepository.existsByEmail(student.getEmail())) {
            throw new DuplicateStudentException("Email already exists");
        }
    }

    private void validateExistingStudent(Long id, Student student) {
        studentRepository.findByStudentId(student.getStudentId())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateStudentException("Student ID already exists");
                    }
                });

        if (student.getEmail() != null) {
            studentRepository.findByEmail(student.getEmail())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new DuplicateStudentException("Email already exists");
                        }
                    });
        }
    }
}