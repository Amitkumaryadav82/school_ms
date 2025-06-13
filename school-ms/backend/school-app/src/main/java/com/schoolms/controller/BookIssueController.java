package com.schoolms.controller;

import com.schoolms.model.BookIssue;
import com.schoolms.service.BookIssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library/book-issues")
@CrossOrigin(origins = "*")
public class BookIssueController {

    private final BookIssueService bookIssueService;

    @Autowired
    public BookIssueController(BookIssueService bookIssueService) {
        this.bookIssueService = bookIssueService;
    }

    @GetMapping
    public List<BookIssue> getAllBookIssues() {
        return bookIssueService.getAllBookIssues();
    }

    @GetMapping("/active")
    public List<BookIssue> getActiveBookIssues() {
        return bookIssueService.getActiveBookIssues();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookIssue> getBookIssueById(@PathVariable Long id) {
        return bookIssueService.getBookIssueById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Book issue record not found with ID: " + id));
    }

    @GetMapping("/user/{userId}")
    public List<BookIssue> getBookIssuesByIssuedTo(@PathVariable String userId) {
        return bookIssueService.getBookIssuesByIssuedTo(userId);
    }

    @GetMapping("/date-range")
    public List<BookIssue> getBookIssuesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return bookIssueService.getBookIssuesByDateRange(startDate, endDate);
    }

    @PostMapping("/issue")
    public ResponseEntity<BookIssue> issueBook(@RequestBody BookIssue bookIssue) {
        try {
            BookIssue issuedBook = bookIssueService.issueBook(bookIssue);
            return new ResponseEntity<>(issuedBook, HttpStatus.CREATED);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/return/{id}")
    public ResponseEntity<BookIssue> returnBook(@PathVariable Long id) {
        try {
            BookIssue returnedBook = bookIssueService.returnBook(id);
            return ResponseEntity.ok(returnedBook);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookIssue(@PathVariable Long id) {
        if (!bookIssueService.getBookIssueById(id).isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Book issue record not found with ID: " + id);
        }
        bookIssueService.deleteBookIssue(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/overdue")
    public List<BookIssue> getOverdueBookIssues() {
        return bookIssueService.getOverdueBookIssues();
    }

    @GetMapping("/inventory-summary")
    public Map<String, Long> getInventorySummary() {
        return bookIssueService.getInventorySummary();
    }

    @GetMapping("/category-analysis")
    public Map<String, Long> getIssuedBooksCountByCategory() {
        return bookIssueService.getIssuedBooksCountByCategory();
    }

    @GetMapping("/date-analysis")
    public Map<LocalDate, Long> getIssueCountByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return bookIssueService.getIssueCountByDateRange(startDate, endDate);
    }
}
