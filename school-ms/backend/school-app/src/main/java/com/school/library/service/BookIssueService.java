package com.school.library.service;

import com.school.library.model.BookIssue;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface BookIssueService {
    List<BookIssue> getAllBookIssues();

    List<BookIssue> getActiveBookIssues();

    Optional<BookIssue> getBookIssueById(Long id);

    List<BookIssue> getBookIssuesByIssuedTo(String issuedTo);

    List<BookIssue> getBookIssuesByDateRange(LocalDate startDate, LocalDate endDate);

    /**
     * Returns book issues that are currently Issued and due on the specified date.
     */
    List<BookIssue> getBookIssuesDueOn(LocalDate date);

    /**
     * Returns book issues that are currently Issued and due between the specified
     * dates (inclusive).
     */
    List<BookIssue> getBookIssuesDueInRange(LocalDate startDate, LocalDate endDate);

    BookIssue issueBook(BookIssue bookIssue);

    BookIssue returnBook(Long issueId);

    /**
     * Returns a book with an explicit return date (overrides default of
     * LocalDate.now()).
     */
    BookIssue returnBook(Long issueId, LocalDate returnDate);

    boolean deleteBookIssue(Long id);

    List<BookIssue> getOverdueBookIssues();

    Map<String, Long> getInventorySummary();

    Map<String, Long> getIssuedBooksCountByCategory();

    Map<LocalDate, Long> getIssueCountByDateRange(LocalDate startDate, LocalDate endDate);

}
