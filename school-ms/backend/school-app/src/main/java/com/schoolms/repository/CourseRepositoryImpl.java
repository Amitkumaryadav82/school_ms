package com.schoolms.repository;

import com.schoolms.model.Course;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class CourseRepositoryImpl implements CourseRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Course> courseRowMapper = (rs, rowNum) -> {
        Course course = new Course();
        course.setId(rs.getLong("id"));
        course.setName(rs.getString("name"));
        course.setDepartment(rs.getString("department"));
        course.setTeacherId(rs.getLong("teacher_id"));
        course.setCredits(rs.getInt("credits"));
        course.setCapacity(rs.getInt("capacity"));
        course.setEnrolled(rs.getInt("enrolled"));
        course.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        course.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());

        // Try to get teacher name from join if available
        try {
            course.setTeacherName(rs.getString("teacher_name"));
        } catch (Exception e) {
            // Teacher name not included in this query
        }

        return course;
    };

    @Autowired
    public CourseRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Course> findAll() {
        String sql = "SELECT c.*, CONCAT(s.first_name, ' ', s.last_name) as teacher_name " +
                "FROM courses c " +
                "LEFT JOIN staff s ON c.teacher_id = s.id";
        return jdbcTemplate.query(sql, courseRowMapper);
    }

    @Override
    public Optional<Course> findById(Long id) {
        String sql = "SELECT c.*, CONCAT(s.first_name, ' ', s.last_name) as teacher_name " +
                "FROM courses c " +
                "LEFT JOIN staff s ON c.teacher_id = s.id " +
                "WHERE c.id = ?";
        try {
            return Optional.of(jdbcTemplate.queryForObject(sql, courseRowMapper, id));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Override
    public Course save(Course course) {
        String sql = "INSERT INTO courses (name, department, teacher_id, credits, capacity, enrolled) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, course.getName());
            ps.setString(2, course.getDepartment());
            if (course.getTeacherId() != null) {
                ps.setLong(3, course.getTeacherId());
            } else {
                ps.setNull(3, java.sql.Types.INTEGER);
            }
            ps.setInt(4, course.getCredits());
            ps.setInt(5, course.getCapacity());
            ps.setInt(6, course.getEnrolled());
            return ps;
        }, keyHolder);

        course.setId(keyHolder.getKey().longValue());
        return course;
    }

    @Override
    public void update(Course course) {
        String sql = "UPDATE courses SET name = ?, department = ?, teacher_id = ?, " +
                "credits = ?, capacity = ?, enrolled = ?, updated_at = ? WHERE id = ?";

        jdbcTemplate.update(sql,
                course.getName(),
                course.getDepartment(),
                course.getTeacherId(),
                course.getCredits(),
                course.getCapacity(),
                course.getEnrolled(),
                Timestamp.valueOf(LocalDateTime.now()),
                course.getId());
    }

    @Override
    public void delete(Long id) {
        jdbcTemplate.update("DELETE FROM courses WHERE id = ?", id);
    }

    @Override
    public List<Course> findByDepartment(String department) {
        String sql = "SELECT c.*, CONCAT(s.first_name, ' ', s.last_name) as teacher_name " +
                "FROM courses c " +
                "LEFT JOIN staff s ON c.teacher_id = s.id " +
                "WHERE c.department = ?";
        return jdbcTemplate.query(sql, courseRowMapper, department);
    }

    @Override
    public List<Course> findByTeacherId(Long teacherId) {
        String sql = "SELECT c.*, CONCAT(s.first_name, ' ', s.last_name) as teacher_name " +
                "FROM courses c " +
                "LEFT JOIN staff s ON c.teacher_id = s.id " +
                "WHERE c.teacher_id = ?";
        return jdbcTemplate.query(sql, courseRowMapper, teacherId);
    }
}