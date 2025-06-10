package com.schoolms.repository;

import com.schoolms.model.Book;
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
}
