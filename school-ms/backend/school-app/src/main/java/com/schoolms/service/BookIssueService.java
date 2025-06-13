package com.schoolms.service;

import com.schoolms.model.BookIssue;
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

    BookIssue issueBook(BookIssue bookIssue);

    BookIssue returnBook(Long issueId);

    boolean deleteBookIssue(Long id);

    List<BookIssue> getOverdueBookIssues();

    Map<String, Long> getInventorySummary();

    Map<String, Long> getIssuedBooksCountByCategory();

    Map<LocalDate, Long> getIssueCountByDateRange(LocalDate startDate, LocalDate endDate);
}
