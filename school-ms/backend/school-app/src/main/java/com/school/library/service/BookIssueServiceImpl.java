package com.school.library.service;

import com.school.library.model.Book;
import com.school.library.model.BookIssue;
import com.school.library.repository.BookIssueRepository;
import com.school.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("libraryBookIssueService")
public class BookIssueServiceImpl implements BookIssueService {

    private final BookIssueRepository bookIssueRepository;
    private final BookRepository bookRepository;

    @Autowired
    public BookIssueServiceImpl(@Qualifier("libraryBookIssueRepositoryImpl") BookIssueRepository bookIssueRepository, 
                              @Qualifier("libraryBookRepositoryImpl") BookRepository bookRepository) {
        this.bookIssueRepository = bookIssueRepository;
        this.bookRepository = bookRepository;
    }

    @Override
    public List<BookIssue> getAllBookIssues() {
        return bookIssueRepository.getAllBookIssues();
    }

    @Override
    public List<BookIssue> getActiveBookIssues() {
        return bookIssueRepository.getActiveBookIssues();
    }

    @Override
    public Optional<BookIssue> getBookIssueById(Long id) {
        return bookIssueRepository.getBookIssueById(id);
    }

    @Override
    public List<BookIssue> getBookIssuesByIssuedTo(String issuedTo) {
        return bookIssueRepository.getBookIssuesByIssuedTo(issuedTo);
    }

    @Override
    public List<BookIssue> getBookIssuesByDateRange(LocalDate startDate, LocalDate endDate) {
        return bookIssueRepository.getBookIssuesByDateRange(startDate, endDate);
    }

    @Override
    @Transactional
    public BookIssue issueBook(BookIssue bookIssue) {
        // Set default values if not provided
        if (bookIssue.getStatus() == null || bookIssue.getStatus().isEmpty()) {
            bookIssue.setStatus("Issued");
        }

        if (bookIssue.getIssueDate() == null) {
            bookIssue.setIssueDate(LocalDate.now());
        }

        // Set due date if not provided (default to 14 days from issue date)
        if (bookIssue.getDueDate() == null) {
            bookIssue.setDueDate(bookIssue.getIssueDate().plusDays(14));
        }

        // Check if book is available
        Optional<Book> bookOpt = bookRepository.getBookById(bookIssue.getBookId());
        if (bookOpt.isPresent()) {
            Book book = bookOpt.get();
            if (!"Available".equals(book.getStatus())) {
                throw new IllegalStateException("Book is not available for issue. Current status: " + book.getStatus());
            }

            // Set the book title in the issue record for convenience
            bookIssue.setBookTitle(book.getTitle());

            return bookIssueRepository.createBookIssue(bookIssue);
        } else {
            throw new IllegalArgumentException("Book not found with ID: " + bookIssue.getBookId());
        }
    }

    @Override
    @Transactional
    public BookIssue returnBook(Long issueId) {
        Optional<BookIssue> bookIssueOpt = bookIssueRepository.getBookIssueById(issueId);
        if (bookIssueOpt.isPresent()) {
            BookIssue bookIssue = bookIssueOpt.get();

            if (!"Issued".equals(bookIssue.getStatus())) {
                throw new IllegalStateException("Book is not currently issued. Status: " + bookIssue.getStatus());
            }

            // Update status and return date
            bookIssue.setStatus("Returned");
            bookIssue.setReturnDate(LocalDate.now());

            return bookIssueRepository.updateBookIssue(bookIssue);
        } else {
            throw new IllegalArgumentException("Book issue record not found with ID: " + issueId);
        }
    }

    @Override
    @Transactional
    public boolean deleteBookIssue(Long id) {
        return bookIssueRepository.deleteBookIssue(id);
    }

    @Override
    public List<BookIssue> getOverdueBookIssues() {
        return bookIssueRepository.getOverdueBookIssues();
    }

    @Override
    public Map<String, Long> getInventorySummary() {
        Map<String, Long> summary = new HashMap<>();

        List<Book> allBooks = bookRepository.getAllBooks();
        long totalBooks = allBooks.size();

        // Count books by status
        Map<String, Long> countByStatus = allBooks.stream()
                .collect(Collectors.groupingBy(
                        Book::getStatus,
                        Collectors.counting()));

        summary.put("Total", totalBooks);
        summary.put("Available", countByStatus.getOrDefault("Available", 0L));
        summary.put("Issued", countByStatus.getOrDefault("Issued", 0L));
        summary.put("Lost", countByStatus.getOrDefault("Lost", 0L));
        summary.put("Damaged", countByStatus.getOrDefault("Damaged", 0L));

        return summary;
    }

    @Override
    public Map<String, Long> getIssuedBooksCountByCategory() {
        List<Book> issuedBooks = bookRepository.getBooksByStatus("Issued");

        return issuedBooks.stream()
                .collect(Collectors.groupingBy(
                        Book::getCategory,
                        Collectors.counting()));
    }

    @Override
    public Map<LocalDate, Long> getIssueCountByDateRange(LocalDate startDate, LocalDate endDate) {
        List<BookIssue> issuesInRange = bookIssueRepository.getBookIssuesByDateRange(startDate, endDate);

        return issuesInRange.stream()
                .collect(Collectors.groupingBy(
                        BookIssue::getIssueDate,
                        Collectors.counting()));
    }
}
