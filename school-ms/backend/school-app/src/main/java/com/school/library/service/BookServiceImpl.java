package com.school.library.service;

import com.school.library.model.Book;
import com.school.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service("libraryBookService")
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;

    public BookServiceImpl(@Qualifier("libraryBookRepositoryImpl") BookRepository bookRepository) {
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
        // Validate unique title (case-insensitive)
        if (book.getTitle() == null || book.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (bookRepository.existsByTitleIgnoreCase(book.getTitle().trim())) {
            throw new IllegalArgumentException("A book with this title already exists");
        }
        // Set default status if not provided
        if (book.getStatus() == null || book.getStatus().isEmpty()) {
            book.setStatus("Available");
        }
        // Create the primary row
        Book created = bookRepository.createBook(book);
        // If client asked for additional copies, create extra rows with same title/author/category/status
        int copies = book.getCopies() != null ? Math.max(1, book.getCopies()) : 1;
        for (int i = 1; i < copies; i++) {
            Book extra = new Book(null, book.getTitle(), book.getAuthor(), book.getCategory(), book.getStatus());
            bookRepository.createBook(extra);
        }
        return created;
    }

    @Override
    @Transactional
    public Book updateBook(Book book) {
        // Optional: enforce unique title on update when changing title
        if (book.getTitle() == null || book.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }
        // Check if another record has the same title (case-insensitive)
        // Simplest approach: if existsByTitleIgnoreCase is true and the current DB record's title differs only by id, we need a finer check.
        // For now, allow if the found title belongs to the same ID. Implement with exact fetch by title then compare IDs.
    Optional<Book> sameTitle = bookRepository.findByTitleIgnoreCase(book.getTitle().trim());
    boolean titleTakenByOther = sameTitle.isPresent() && (book.getId() == null || !sameTitle.get().getId().equals(book.getId()));
        if (titleTakenByOther) {
            throw new IllegalArgumentException("A book with this title already exists");
        }
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

    @Override
    public boolean titleExistsIgnoreCase(String title) {
        if (title == null) return false;
        return bookRepository.existsByTitleIgnoreCase(title.trim());
    }

    @Override
    @Transactional
    public Map<String, Object> bulkUpsertBooks(List<Book> books) {
        int created = 0;
        int updated = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < books.size(); i++) {
            Book row = books.get(i);
            try {
                if (row.getTitle() == null || row.getTitle().trim().isEmpty() ||
                        row.getAuthor() == null || row.getAuthor().trim().isEmpty()) {
                    skipped++;
                    continue;
                }

                // try find by exact title and author
                List<Book> existingByTitle = bookRepository.getBooksByTitle(row.getTitle());
                Book match = existingByTitle.stream()
                        .filter(b -> b.getAuthor() != null && b.getAuthor().equalsIgnoreCase(row.getAuthor()))
                        .findFirst().orElse(null);

                if (match == null) {
                    // If any copy already exists with this title (case-insensitive), skip this row entirely
                    if (bookRepository.existsByTitleIgnoreCase(row.getTitle())) {
                        skipped++;
                        continue;
                    }
                    // Create desired number of copies (default 1)
                    int copies = (row.getCopies() != null && row.getCopies() > 0) ? row.getCopies() : 1;
                    for (int c = 0; c < copies; c++) {
                        Book toCreate = new Book(null, row.getTitle(), row.getAuthor(), row.getCategory(), row.getStatus());
                        if (toCreate.getStatus() == null || toCreate.getStatus().isEmpty()) {
                            toCreate.setStatus("Available");
                        }
                        bookRepository.createBook(toCreate);
                        created++;
                    }
                } else {
                    match.setCategory(row.getCategory() != null ? row.getCategory() : match.getCategory());
                    match.setStatus(row.getStatus() != null ? row.getStatus() : match.getStatus());
                    bookRepository.updateBook(match);
                    updated++;
                }
            } catch (Exception e) {
                errors.add("Row " + (i + 1) + ": " + e.getMessage());
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("created", created);
        summary.put("updated", updated);
        summary.put("skipped", skipped);
        summary.put("errors", errors);
        summary.put("total", books.size());
        return summary;
    }
}
