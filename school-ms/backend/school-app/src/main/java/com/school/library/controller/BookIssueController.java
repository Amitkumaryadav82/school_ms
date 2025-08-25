package com.school.library.controller;

import com.school.library.model.BookIssue;
import com.school.library.service.BookIssueService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library/book-issues")
public class BookIssueController {

    private final BookIssueService bookIssueService;

    public BookIssueController(@Qualifier("libraryBookIssueService") BookIssueService bookIssueService) {
        this.bookIssueService = bookIssueService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public List<BookIssue> getAllBookIssues() {
        return bookIssueService.getAllBookIssues();
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public List<BookIssue> getActiveBookIssues() {
        return bookIssueService.getActiveBookIssues();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<BookIssue> getBookIssueById(@PathVariable Long id) {
        return bookIssueService.getBookIssueById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Book issue record not found with ID: " + id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public List<BookIssue> getBookIssuesByIssuedTo(@PathVariable String userId) {
        return bookIssueService.getBookIssuesByIssuedTo(userId);
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public List<BookIssue> getBookIssuesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return bookIssueService.getBookIssuesByDateRange(startDate, endDate);
    }

    @PostMapping("/issue")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<BookIssue> issueBook(@RequestBody BookIssue bookIssue) {
        try {
            BookIssue issuedBook = bookIssueService.issueBook(bookIssue);
            return new ResponseEntity<>(issuedBook, HttpStatus.CREATED);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/return/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<BookIssue> returnBook(
        @PathVariable Long id,
        @RequestParam(value = "returnDate", required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate returnDate) {
        try {
        BookIssue returnedBook = (returnDate == null)
            ? bookIssueService.returnBook(id)
            : bookIssueService.returnBook(id, returnDate);
            return ResponseEntity.ok(returnedBook);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<Void> deleteBookIssue(@PathVariable Long id) {
        if (!bookIssueService.getBookIssueById(id).isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Book issue record not found with ID: " + id);
        }
        bookIssueService.deleteBookIssue(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public List<BookIssue> getOverdueBookIssues() {
        return bookIssueService.getOverdueBookIssues();
    }

    @GetMapping("/inventory-summary")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public Map<String, Long> getInventorySummary() {
        return bookIssueService.getInventorySummary();
    }

    @GetMapping("/category-analysis")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public Map<String, Long> getIssuedBooksCountByCategory() {
        return bookIssueService.getIssuedBooksCountByCategory();
    }

    @GetMapping("/date-analysis")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public Map<LocalDate, Long> getIssueCountByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return bookIssueService.getIssueCountByDateRange(startDate, endDate);
    }

    @GetMapping("/due-on")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public List<BookIssue> getBookIssuesDueOn(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return bookIssueService.getBookIssuesDueOn(date);
    }

    @GetMapping("/due-in-week")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public List<BookIssue> getBookIssuesDueInWeek(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return bookIssueService.getBookIssuesDueInRange(start, end);
    }
}
