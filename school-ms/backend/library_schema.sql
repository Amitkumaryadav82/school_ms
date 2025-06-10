-- Library Management Module Tables

-- Books table
CREATE TABLE IF NOT EXISTS public.books (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Book Issue records table
CREATE TABLE IF NOT EXISTS public.book_issues (
    id BIGSERIAL PRIMARY KEY,
    book_id BIGINT NOT NULL,
    issued_to VARCHAR(50) NOT NULL,
    issue_type VARCHAR(20) NOT NULL,  -- "Student" or "Staff"
    issuee_name VARCHAR(255),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Issued',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_book FOREIGN KEY (book_id) REFERENCES books(id),
    CONSTRAINT status_values CHECK (status IN ('Issued', 'Returned'))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books(author);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_book_issues_book_id ON public.book_issues(book_id);
CREATE INDEX IF NOT EXISTS idx_book_issues_issued_to ON public.book_issues(issued_to);
CREATE INDEX IF NOT EXISTS idx_book_issues_issue_date ON public.book_issues(issue_date);
CREATE INDEX IF NOT EXISTS idx_book_issues_due_date ON public.book_issues(due_date);
CREATE INDEX IF NOT EXISTS idx_book_issues_status ON public.book_issues(status);

-- Sample data for books table (optional)
INSERT INTO public.books (title, author, category, status) VALUES 
('To Kill a Mockingbird', 'Harper Lee', 'Fiction', 'Available'),
('1984', 'George Orwell', 'Fiction', 'Available'),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 'Available'),
('Pride and Prejudice', 'Jane Austen', 'Fiction', 'Available'),
('The Catcher in the Rye', 'J.D. Salinger', 'Fiction', 'Available'),
('Lord of the Flies', 'William Golding', 'Fiction', 'Available'),
('Animal Farm', 'George Orwell', 'Fiction', 'Available'),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 'Available'),
('The Lord of the Rings', 'J.R.R. Tolkien', 'Fantasy', 'Available'),
('Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 'Fantasy', 'Available'),
('A Brief History of Time', 'Stephen Hawking', 'Science', 'Available'),
('The Origin of Species', 'Charles Darwin', 'Science', 'Available'),
('A Textbook of Mathematics', 'R.D. Sharma', 'Education', 'Available'),
('Science for Class X', 'NCERT', 'Education', 'Available'),
('Social Studies for Class IX', 'NCERT', 'Education', 'Available'),
('English Grammar & Composition', 'Wren & Martin', 'Education', 'Available'),
('Computer Science with Python', 'Sumita Arora', 'Education', 'Available'),
('Physics for Class XII - Part I', 'H.C. Verma', 'Education', 'Available'),
('Chemistry for Class XII', 'NCERT', 'Education', 'Available'),
('Biology for Class XI', 'NCERT', 'Education', 'Available');
