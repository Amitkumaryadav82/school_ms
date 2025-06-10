package com.schoolms.repository;

import com.schoolms.model.BookIssue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class BookIssueRepositoryImpl implements BookIssueRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<BookIssue> bookIssueRowMapper = (rs, rowNum) -> {
        BookIssue bookIssue = new BookIssue();
        bookIssue.setId(rs.getLong("id"));
        bookIssue.setBookId(rs.getLong("book_id"));
        bookIssue.setBookTitle(rs.getString("book_title"));
        bookIssue.setIssuedTo(rs.getString("issued_to"));
        bookIssue.setIssueType(rs.getString("issue_type"));
        bookIssue.setIssueeName(rs.getString("issuee_name"));
        bookIssue.setIssueDate(rs.getObject("issue_date", LocalDate.class));
        bookIssue.setDueDate(rs.getObject("due_date", LocalDate.class));
        bookIssue.setReturnDate(rs.getObject("return_date", LocalDate.class));
        bookIssue.setStatus(rs.getString("status"));
        bookIssue.setCreatedAt(rs.getObject("created_at", LocalDateTime.class));
        bookIssue.setUpdatedAt(rs.getObject("updated_at", LocalDateTime.class));
        return bookIssue;
    };

    @Autowired
    public BookIssueRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<BookIssue> getAllBookIssues() {
        String sql = "SELECT bi.*, b.title as book_title FROM book_issues bi " +
                "JOIN books b ON bi.book_id = b.id " +
                "ORDER BY bi.issue_date DESC";
        return jdbcTemplate.query(sql, bookIssueRowMapper);
    }

    @Override
    public List<BookIssue> getActiveBookIssues() {
        String sql = "SELECT bi.*, b.title as book_title FROM book_issues bi " +
                "JOIN books b ON bi.book_id = b.id " +
                "WHERE bi.status = 'Issued' " +
                "ORDER BY bi.due_date ASC";
        return jdbcTemplate.query(sql, bookIssueRowMapper);
    }

    @Override
    public Optional<BookIssue> getBookIssueById(Long id) {
        try {
            String sql = "SELECT bi.*, b.title as book_title FROM book_issues bi " +
                    "JOIN books b ON bi.book_id = b.id " +
                    "WHERE bi.id = ?";
            BookIssue bookIssue = jdbcTemplate.queryForObject(sql, bookIssueRowMapper, id);
            return Optional.ofNullable(bookIssue);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Override
    public List<BookIssue> getBookIssuesByIssuedTo(String issuedTo) {
        String sql = "SELECT bi.*, b.title as book_title FROM book_issues bi " +
                "JOIN books b ON bi.book_id = b.id " +
                "WHERE bi.issued_to = ? " +
                "ORDER BY bi.issue_date DESC";
        return jdbcTemplate.query(sql, bookIssueRowMapper, issuedTo);
    }

    @Override
    public List<BookIssue> getBookIssuesByDateRange(LocalDate startDate, LocalDate endDate) {
        String sql = "SELECT bi.*, b.title as book_title FROM book_issues bi " +
                "JOIN books b ON bi.book_id = b.id " +
                "WHERE bi.issue_date BETWEEN ? AND ? " +
                "ORDER BY bi.issue_date DESC";
        return jdbcTemplate.query(sql, bookIssueRowMapper, startDate, endDate);
    }

    @Override
    public BookIssue createBookIssue(BookIssue bookIssue) {
        String sql = "INSERT INTO book_issues (book_id, issued_to, issue_type, issuee_name, " +
                "issue_date, due_date, status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        LocalDateTime now = LocalDateTime.now();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, bookIssue.getBookId());
            ps.setString(2, bookIssue.getIssuedTo());
            ps.setString(3, bookIssue.getIssueType());
            ps.setString(4, bookIssue.getIssueeName());
            ps.setObject(5, bookIssue.getIssueDate());
            ps.setObject(6, bookIssue.getDueDate());
            ps.setString(7, bookIssue.getStatus());
            ps.setObject(8, now);
            ps.setObject(9, now);
            return ps;
        }, keyHolder);
        
        bookIssue.setId(keyHolder.getKey().longValue());
        bookIssue.setCreatedAt(now);
        bookIssue.setUpdatedAt(now);
        
        // Update book status to "Issued"
        jdbcTemplate.update("UPDATE books SET status = 'Issued', updated_at = ? WHERE id = ?", 
                now, bookIssue.getBookId());
        
        return bookIssue;
    }

    @Override
    public BookIssue updateBookIssue(BookIssue bookIssue) {
        String sql = "UPDATE book_issues SET issued_to = ?, issue_type = ?, issuee_name = ?, " +
                "issue_date = ?, due_date = ?, return_date = ?, status = ?, updated_at = ? " +
                "WHERE id = ?";
        
        LocalDateTime now = LocalDateTime.now();
        
        jdbcTemplate.update(sql,
                bookIssue.getIssuedTo(),
                bookIssue.getIssueType(),
                bookIssue.getIssueeName(),
                bookIssue.getIssueDate(),
                bookIssue.getDueDate(),
                bookIssue.getReturnDate(),
                bookIssue.getStatus(),
                now,
                bookIssue.getId());
        
        // If the book has been returned, update its status
        if ("Returned".equals(bookIssue.getStatus())) {
            jdbcTemplate.update("UPDATE books SET status = 'Available', updated_at = ? WHERE id = ?", 
                    now, bookIssue.getBookId());
        }
        
        bookIssue.setUpdatedAt(now);
        return bookIssue;
    }

    @Override
    public boolean deleteBookIssue(Long id) {
        // First, get the book ID so we can update its status if necessary
        Optional<BookIssue> bookIssue = getBookIssueById(id);
        if (bookIssue.isPresent() && "Issued".equals(bookIssue.get().getStatus())) {
            // Update book status to Available
            jdbcTemplate.update("UPDATE books SET status = 'Available', updated_at = ? WHERE id = ?", 
                    LocalDateTime.now(), bookIssue.get().getBookId());
        }
        
        String sql = "DELETE FROM book_issues WHERE id = ?";
        return jdbcTemplate.update(sql, id) > 0;
    }

    @Override
    public List<BookIssue> getBookIssuesByBookId(Long bookId) {
        String sql = "SELECT bi.*, b.title as book_title FROM book_issues bi " +
                "JOIN books b ON bi.book_id = b.id " +
                "WHERE bi.book_id = ? " +
                "ORDER BY bi.issue_date DESC";
        return jdbcTemplate.query(sql, bookIssueRowMapper, bookId);
    }

    @Override
    public List<BookIssue> getOverdueBookIssues() {
        String sql = "SELECT bi.*, b.title as book_title FROM book_issues bi " +
                "JOIN books b ON bi.book_id = b.id " +
                "WHERE bi.status = 'Issued' AND bi.due_date < CURRENT_DATE " +
                "ORDER BY bi.due_date ASC";
        return jdbcTemplate.query(sql, bookIssueRowMapper);
    }
}
