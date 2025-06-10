import api from './api';

// Book Interface
export interface Book {
  id?: number;
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Book Issue Interface
export interface BookIssue {
  id?: number;
  bookId: number;
  bookTitle?: string;
  issuedTo: string;
  issueType: string; // "Student" or "Staff"
  issueeName?: string;
  issueDate?: string; // ISO date format
  dueDate?: string; // ISO date format
  returnDate?: string; // ISO date format
  status: string; // "Issued" or "Returned"
}

// Report Filter Interface
export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
  issueType?: string;
}

export enum BookStatus {
  AVAILABLE = 'Available',
  ISSUED = 'Issued',
  LOST = 'Lost',
  DAMAGED = 'Damaged'
}

// Book Service API
export const libraryService = {
  // Book Management
  getAllBooks: () => 
    api.get<Book[]>('/library/books'),
  
  getBookById: (id: number) =>
    api.get<Book>(`/library/books/${id}`),
  
  getBooksByStatus: (status: string) =>
    api.get<Book[]>(`/library/books/status/${status}`),
  
  searchBooks: (query: string) =>
    api.get<Book[]>(`/library/books/search?query=${encodeURIComponent(query)}`),
  
  searchBooksByCategory: (category: string) =>
    api.get<Book[]>(`/library/books/category/${encodeURIComponent(category)}`),
  
  createBook: (book: Book) =>
    api.post<Book>('/library/books', book),
  
  updateBook: (id: number, book: Book) =>
    api.put<Book>(`/library/books/${id}`, book),
  
  deleteBook: (id: number) =>
    api.delete(`/library/books/${id}`),
  
  getAllCategories: () =>
    api.get<string[]>('/library/books/categories'),
  
  getAllAuthors: () =>
    api.get<string[]>('/library/books/authors'),
  
  getBookCounts: () =>
    api.get<Record<string, number>>('/library/books/counts'),
  
  // Book Issue Management
  getAllBookIssues: () =>
    api.get<BookIssue[]>('/library/book-issues'),
  
  getActiveBookIssues: () =>
    api.get<BookIssue[]>('/library/book-issues/active'),
  
  getBookIssueById: (id: number) =>
    api.get<BookIssue>(`/library/book-issues/${id}`),
  
  getBookIssuesByUser: (userId: string) =>
    api.get<BookIssue[]>(`/library/book-issues/user/${userId}`),
  
  getBookIssuesByDateRange: (startDate: string, endDate: string) =>
    api.get<BookIssue[]>(`/library/book-issues/date-range?startDate=${startDate}&endDate=${endDate}`),
  
  issueBook: (bookIssue: BookIssue) =>
    api.post<BookIssue>('/library/book-issues/issue', bookIssue),
  
  returnBook: (id: number) =>
    api.put<BookIssue>(`/library/book-issues/return/${id}`),
  
  deleteBookIssue: (id: number) =>
    api.delete(`/library/book-issues/${id}`),
  
  getOverdueBookIssues: () =>
    api.get<BookIssue[]>('/library/book-issues/overdue'),
  
  // Reports
  getInventorySummary: () =>
    api.get<Record<string, number>>('/library/book-issues/inventory-summary'),
  
  getIssuedBooksCountByCategory: () =>
    api.get<Record<string, number>>('/library/book-issues/category-analysis'),
  
  getIssueCountByDateRange: (startDate: string, endDate: string) =>
    api.get<Record<string, number>>(`/library/book-issues/date-analysis?startDate=${startDate}&endDate=${endDate}`)
};

export default libraryService;
