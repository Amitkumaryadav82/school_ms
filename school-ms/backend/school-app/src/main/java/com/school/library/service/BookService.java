package com.school.library.service;

import com.school.library.model.Book;
import java.util.List;
import java.util.Optional;

public interface BookService {
    List<Book> getAllBooks();

    List<Book> getBooksByStatus(String status);

    List<Book> searchBooks(String query);

    List<Book> searchBooksByCategory(String category);

    Optional<Book> getBookById(Long id);

    Book createBook(Book book);

    Book updateBook(Book book);

    boolean deleteBook(Long id);

    List<String> getAllCategories();

    List<String> getAllAuthors();

    long countBooksByStatus(String status);
}
