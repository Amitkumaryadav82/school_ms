package com.school.course.repository;

import com.school.course.model.Course;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Legacy JDBC repository expecting columns (department, teacher_id, credits,
 * capacity, enrolled)
 * that no longer exist in the authoritative courses schema. Disabled by
 * default.
 * Enable only if the database schema is extended to include these columns
 * again.
 */
@Repository
@ConditionalOnProperty(value = "legacy.courses.enabled", havingValue = "true")
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

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            course.setCreatedAt(createdAt.toLocalDateTime());
        }

        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            course.setUpdatedAt(updatedAt.toLocalDateTime());
        }

        return course;
    };

    public CourseRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Course> findAll() {
        String sql = "SELECT * FROM courses ORDER BY name";
        return jdbcTemplate.query(sql, courseRowMapper);
    }

    @Override
    public Optional<Course> findById(Long id) {
        String sql = "SELECT * FROM courses WHERE id = ?";
        List<Course> courses = jdbcTemplate.query(sql, courseRowMapper, id);
        return courses.isEmpty() ? Optional.empty() : Optional.of(courses.get(0));
    }

    @Override
    public Course save(Course course) {
        String sql = "INSERT INTO courses (name, department, teacher_id, credits, capacity, enrolled, created_at, updated_at) "
                +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        LocalDateTime now = LocalDateTime.now();
        course.setCreatedAt(now);
        course.setUpdatedAt(now);

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, course.getName());
            ps.setString(2, course.getDepartment());
            ps.setLong(3, course.getTeacherId());
            ps.setInt(4, course.getCredits());
            ps.setInt(5, course.getCapacity());
            ps.setInt(6, course.getEnrolled());
            ps.setTimestamp(7, Timestamp.valueOf(course.getCreatedAt()));
            ps.setTimestamp(8, Timestamp.valueOf(course.getUpdatedAt()));
            return ps;
        }, keyHolder);

        course.setId(Objects.requireNonNull(keyHolder.getKey()).longValue());
        return course;
    }

    @Override
    public void update(Course course) {
        String sql = "UPDATE courses SET name = ?, department = ?, teacher_id = ?, " +
                "credits = ?, capacity = ?, enrolled = ?, updated_at = ? " +
                "WHERE id = ?";

        course.setUpdatedAt(LocalDateTime.now());

        jdbcTemplate.update(sql,
                course.getName(),
                course.getDepartment(),
                course.getTeacherId(),
                course.getCredits(),
                course.getCapacity(),
                course.getEnrolled(),
                Timestamp.valueOf(course.getUpdatedAt()),
                course.getId());
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM courses WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    @Override
    public List<Course> findByDepartment(String department) {
        String sql = "SELECT * FROM courses WHERE department = ? ORDER BY name";
        return jdbcTemplate.query(sql, courseRowMapper, department);
    }

    @Override
    public List<Course> findByTeacherId(Long teacherId) {
        String sql = "SELECT * FROM courses WHERE teacher_id = ? ORDER BY name";
        return jdbcTemplate.query(sql, courseRowMapper, teacherId);
    }

    @Override
    public List<Course> findAvailableCourses() {
        String sql = "SELECT * FROM courses WHERE capacity > enrolled ORDER BY name";
        return jdbcTemplate.query(sql, courseRowMapper);
    }

    @Override
    public void deleteById(Long id) {
        delete(id);
    }

    @Override
    public boolean existsById(Long id) {
        String sql = "SELECT COUNT(*) FROM courses WHERE id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
        return count != null && count > 0;
    }
}