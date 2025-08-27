package com.school.library.service;

import com.school.attendance.service.HolidayAttendanceService;
import com.school.library.model.Book;
import com.school.library.model.BookIssue;
import com.school.library.repository.BookIssueRepository;
import com.school.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
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
    private final HolidayAttendanceService holidayAttendanceService;

    public BookIssueServiceImpl(@Qualifier("libraryBookIssueRepositoryImpl") BookIssueRepository bookIssueRepository,
            @Qualifier("libraryBookRepositoryImpl") BookRepository bookRepository,
            HolidayAttendanceService holidayAttendanceService) {
        this.bookIssueRepository = bookIssueRepository;
        this.bookRepository = bookRepository;
        this.holidayAttendanceService = holidayAttendanceService;
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

        // Set due date if not provided: default to +5 working days (skip weekends and
        // holidays)
        if (bookIssue.getDueDate() == null) {
            bookIssue.setDueDate(addWorkingDays(bookIssue.getIssueDate(), 5));
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
        return returnBook(issueId, LocalDate.now());
    }

    @Override
    @Transactional
    public BookIssue returnBook(Long issueId, LocalDate returnDate) {
        Optional<BookIssue> bookIssueOpt = bookIssueRepository.getBookIssueById(issueId);
        if (bookIssueOpt.isPresent()) {
            BookIssue bookIssue = bookIssueOpt.get();

            if (!"Issued".equals(bookIssue.getStatus())) {
                throw new IllegalStateException("Book is not currently issued. Status: " + bookIssue.getStatus());
            }

            // Update status and return date
            bookIssue.setStatus("Returned");
            bookIssue.setReturnDate(returnDate != null ? returnDate : LocalDate.now());

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
    public List<BookIssue> getBookIssuesDueOn(LocalDate date) {
        return bookIssueRepository.getBookIssuesDueInRange(date, date);
    }

    @Override
    public List<BookIssue> getBookIssuesDueInRange(LocalDate startDate, LocalDate endDate) {
        return bookIssueRepository.getBookIssuesDueInRange(startDate, endDate);
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

    /**
     * Adds the specified number of working days to the start date, skipping
     * weekends and holidays.
     */
    private LocalDate addWorkingDays(LocalDate start, int workingDays) {
        LocalDate date = start;
        int added = 0;
        while (added < workingDays) {
            date = date.plusDays(1);
            DayOfWeek dow = date.getDayOfWeek();
            boolean weekend = (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY);
            boolean holiday = holidayAttendanceService != null && holidayAttendanceService.isHoliday(date);
            if (!weekend && !holiday) {
                added++;
            }
        }
        return date;
    }

}
