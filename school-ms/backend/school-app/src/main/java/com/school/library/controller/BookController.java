package com.school.library.controller;

import com.school.library.model.Book;
import com.school.library.service.BookService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library/books")
public class BookController {

    private final BookService bookService;

    public BookController(@Qualifier("libraryBookService") BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found with ID: " + id));
    }

    @GetMapping("/status/{status}")
    public List<Book> getBooksByStatus(@PathVariable String status) {
        return bookService.getBooksByStatus(status);
    }

    @GetMapping("/search")
    public List<Book> searchBooks(@RequestParam String query) {
        return bookService.searchBooks(query);
    }

    @GetMapping("/category/{category}")
    public List<Book> searchBooksByCategory(@PathVariable String category) {
        return bookService.searchBooksByCategory(category);
    }

    @PostMapping
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        try {
            Book createdBook = bookService.createBook(book);
            return new ResponseEntity<>(createdBook, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book book) {
        if (!bookService.getBookById(id).isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found with ID: " + id);
        }
        book.setId(id);
        try {
            Book updatedBook = bookService.updateBook(book);
            return ResponseEntity.ok(updatedBook);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage());
        }
    }

    @GetMapping("/exists")
    public Map<String, Boolean> titleExists(@RequestParam("title") String title) {
        boolean exists = bookService.titleExistsIgnoreCase(title);
        Map<String, Boolean> res = new HashMap<>();
        res.put("exists", exists);
        return res;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        if (!bookService.getBookById(id).isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found with ID: " + id);
        }
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categories")
    public List<String> getAllCategories() {
        return bookService.getAllCategories();
    }

    @GetMapping("/authors")
    public List<String> getAllAuthors() {
        return bookService.getAllAuthors();
    }

    @GetMapping("/counts")
    public Map<String, Long> getBookCounts() {
        Map<String, Long> counts = new HashMap<>();
        counts.put("total", (long) bookService.getAllBooks().size());
        counts.put("available", bookService.countBooksByStatus("Available"));
        counts.put("issued", bookService.countBooksByStatus("Issued"));
        counts.put("lost", bookService.countBooksByStatus("Lost"));
        counts.put("damaged", bookService.countBooksByStatus("Damaged"));
        return counts;
    }

    @PostMapping(value = "/upload-csv", consumes = { "multipart/form-data" })
    public ResponseEntity<Map<String, Object>> uploadBooksCsv(@RequestPart("file") MultipartFile file) {
        try {
            List<Book> rows = new ArrayList<>();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                boolean isFirst = true;
                while ((line = reader.readLine()) != null) {
                    if (isFirst) { // skip header
                        isFirst = false;
                        continue;
                    }
                    String[] parts = line.split(",");
                    if (parts.length < 2) continue; // need at least title, author
                    Book b = new Book();
                    b.setTitle(parts[0].trim());
                    b.setAuthor(parts[1].trim());
                    if (parts.length > 2) b.setCategory(parts[2].trim());
                    if (parts.length > 3) b.setStatus(parts[3].trim());
                    if (parts.length > 4) {
                        try {
                            b.setCopies(Integer.parseInt(parts[4].trim()));
                        } catch (NumberFormatException ignored) { /* leave null */ }
                    }
                    rows.add(b);
                }
            }
            Map<String, Object> result = bookService.bulkUpsertBooks(rows);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to process CSV: " + e.getMessage());
        }
    }
}
