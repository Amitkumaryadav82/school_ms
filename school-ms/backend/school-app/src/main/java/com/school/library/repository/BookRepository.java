package com.school.library.repository;

import com.school.library.model.Book;
import java.util.List;
import java.util.Optional;

public interface BookRepository {
    List<Book> getAllBooks();

    List<Book> getBooksByStatus(String status);

    List<Book> searchBooks(String query);

    List<Book> searchBooksByCategory(String category);

    Optional<Book> getBookById(Long id);

    Book createBook(Book book);

    Book updateBook(Book book);

    boolean deleteBook(Long id);

    List<Book> getBooksByAuthor(String author);

    List<Book> getBooksByTitle(String title);

    default Optional<Book> findByTitleAndAuthorExact(String title, String author) { return Optional.empty(); }

    /**
     * Checks if any book exists with the given title, case-insensitive.
     */
    boolean existsByTitleIgnoreCase(String title);

    /**
     * Finds a single book by exact title, case-insensitive.
     */
    Optional<Book> findByTitleIgnoreCase(String title);
}
