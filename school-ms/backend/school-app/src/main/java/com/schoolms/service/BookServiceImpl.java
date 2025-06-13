package com.schoolms.service;

import com.schoolms.model.Book;
import com.schoolms.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;

    @Autowired
    public BookServiceImpl(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    public List<Book> getAllBooks() {
        return bookRepository.getAllBooks();
    }

    @Override
    public List<Book> getBooksByStatus(String status) {
        return bookRepository.getBooksByStatus(status);
    }

    @Override
    public List<Book> searchBooks(String query) {
        return bookRepository.searchBooks(query);
    }

    @Override
    public List<Book> searchBooksByCategory(String category) {
        return bookRepository.searchBooksByCategory(category);
    }

    @Override
    public Optional<Book> getBookById(Long id) {
        return bookRepository.getBookById(id);
    }

    @Override
    @Transactional
    public Book createBook(Book book) {
        // Set default status if not provided
        if (book.getStatus() == null || book.getStatus().isEmpty()) {
            book.setStatus("Available");
        }
        return bookRepository.createBook(book);
    }

    @Override
    @Transactional
    public Book updateBook(Book book) {
        return bookRepository.updateBook(book);
    }

    @Override
    @Transactional
    public boolean deleteBook(Long id) {
        return bookRepository.deleteBook(id);
    }

    @Override
    public List<String> getAllCategories() {
        List<Book> books = bookRepository.getAllBooks();
        Set<String> uniqueCategories = new HashSet<>();

        for (Book book : books) {
            if (book.getCategory() != null && !book.getCategory().isEmpty()) {
                uniqueCategories.add(book.getCategory());
            }
        }

        return new ArrayList<>(uniqueCategories);
    }

    @Override
    public List<String> getAllAuthors() {
        List<Book> books = bookRepository.getAllBooks();
        Set<String> uniqueAuthors = new HashSet<>();

        for (Book book : books) {
            if (book.getAuthor() != null && !book.getAuthor().isEmpty()) {
                uniqueAuthors.add(book.getAuthor());
            }
        }

        return new ArrayList<>(uniqueAuthors);
    }

    @Override
    public long countBooksByStatus(String status) {
        List<Book> books = bookRepository.getBooksByStatus(status);
        return books.size();
    }
}
