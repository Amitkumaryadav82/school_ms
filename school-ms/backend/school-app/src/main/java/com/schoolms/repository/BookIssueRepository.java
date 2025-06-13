package com.schoolms.repository;

import com.schoolms.model.BookIssue;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookIssueRepository {
    List<BookIssue> getAllBookIssues();

    List<BookIssue> getActiveBookIssues();

    Optional<BookIssue> getBookIssueById(Long id);

    List<BookIssue> getBookIssuesByIssuedTo(String issuedTo);

    List<BookIssue> getBookIssuesByDateRange(LocalDate startDate, LocalDate endDate);

    BookIssue createBookIssue(BookIssue bookIssue);

    BookIssue updateBookIssue(BookIssue bookIssue);

    boolean deleteBookIssue(Long id);

    List<BookIssue> getBookIssuesByBookId(Long bookId);

    List<BookIssue> getOverdueBookIssues();
}
