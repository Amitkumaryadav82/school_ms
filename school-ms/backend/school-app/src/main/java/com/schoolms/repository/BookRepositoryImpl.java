package com.schoolms.repository;

import com.schoolms.model.Book;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class BookRepositoryImpl implements BookRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Book> bookRowMapper = (rs, rowNum) -> {
        Book book = new Book();
        book.setId(rs.getLong("id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setCategory(rs.getString("category"));
        book.setStatus(rs.getString("status"));
        book.setCreatedAt(rs.getObject("created_at", LocalDateTime.class));
        book.setUpdatedAt(rs.getObject("updated_at", LocalDateTime.class));
        return book;
    };

    @Autowired
    public BookRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Book> getAllBooks() {
        String sql = "SELECT * FROM books ORDER BY title";
        return jdbcTemplate.query(sql, bookRowMapper);
    }

    @Override
    public List<Book> getBooksByStatus(String status) {
        String sql = "SELECT * FROM books WHERE status = ? ORDER BY title";
        return jdbcTemplate.query(sql, bookRowMapper, status);
    }

    @Override
    public List<Book> searchBooks(String query) {
        String searchQuery = "%" + query.toLowerCase() + "%";
        String sql = "SELECT * FROM books WHERE LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(category) LIKE ? ORDER BY title";
        return jdbcTemplate.query(sql, bookRowMapper, searchQuery, searchQuery, searchQuery);
    }

    @Override
    public List<Book> searchBooksByCategory(String category) {
        String sql = "SELECT * FROM books WHERE category = ? ORDER BY title";
        return jdbcTemplate.query(sql, bookRowMapper, category);
    }

    @Override
    public Optional<Book> getBookById(Long id) {
        try {
            String sql = "SELECT * FROM books WHERE id = ?";
            Book book = jdbcTemplate.queryForObject(sql, bookRowMapper, id);
            return Optional.ofNullable(book);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Override
    public Book createBook(Book book) {
        String sql = "INSERT INTO books (title, author, category, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        LocalDateTime now = LocalDateTime.now();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, book.getTitle());
            ps.setString(2, book.getAuthor());
            ps.setString(3, book.getCategory());
            ps.setString(4, book.getStatus());
            ps.setObject(5, now);
            ps.setObject(6, now);
            return ps;
        }, keyHolder);
        
        book.setId(keyHolder.getKey().longValue());
        book.setCreatedAt(now);
        book.setUpdatedAt(now);
        
        return book;
    }

    @Override
    public Book updateBook(Book book) {
        String sql = "UPDATE books SET title = ?, author = ?, category = ?, status = ?, updated_at = ? WHERE id = ?";
        
        LocalDateTime now = LocalDateTime.now();
        
        jdbcTemplate.update(sql,
                book.getTitle(),
                book.getAuthor(),
                book.getCategory(),
                book.getStatus(),
                now,
                book.getId());
        
        book.setUpdatedAt(now);
        return book;
    }

    @Override
    public boolean deleteBook(Long id) {
        String sql = "DELETE FROM books WHERE id = ?";
        return jdbcTemplate.update(sql, id) > 0;
    }

    @Override
    public List<Book> getBooksByAuthor(String author) {
        String sql = "SELECT * FROM books WHERE author = ? ORDER BY title";
        return jdbcTemplate.query(sql, bookRowMapper, author);
    }

    @Override
    public List<Book> getBooksByTitle(String title) {
        String searchTitle = "%" + title.toLowerCase() + "%";
        String sql = "SELECT * FROM books WHERE LOWER(title) LIKE ? ORDER BY title";
        return jdbcTemplate.query(sql, bookRowMapper, searchTitle);
    }
}
