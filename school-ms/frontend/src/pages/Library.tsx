import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, Chip, Stack, Button, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Divider, Menu } from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { libraryService, BookIssue, Book, BookStatus } from '../services/libraryService';
import { studentService } from '../services/studentService';
import { staffService } from '../services/staffService';
import BulkBookUploadDialog from '../components/library/BulkBookUploadDialog';
import AddBookDialog from '../components/library/AddBookDialog';
import IssueReturnDialog from '../components/library/IssueReturnDialog';
import ReturnBookDialog from '../components/library/ReturnBookDialog';
// CSV export removed as per request

type Counts = Record<string, number>;

const StatCard: React.FC<{ title: string; value: number; icon?: React.ReactNode; color?: 'primary'|'secondary'|'success'|'warning' }>
  = ({ title, value, icon }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent sx={{ py: 1, px: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Typography variant="body2" color="text.primary">
          {title}: <strong>{Number.isFinite(value) ? value : 0}</strong>
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const Library: React.FC = () => {
  const [counts, setCounts] = useState<Counts>({ total: 0, available: 0, issued: 0, lost: 0, damaged: 0 });
  const [overdue, setOverdue] = useState<number>(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [bookMenuAnchor, setBookMenuAnchor] = useState<null | HTMLElement>(null);
  const [showIssue, setShowIssue] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [statusBooks, setStatusBooks] = useState<Book[]>([]);
  const [loadingStatusBooks, setLoadingStatusBooks] = useState(false);
  const [updatingBookId, setUpdatingBookId] = useState<number | null>(null);
  // Maps for displaying names in Issued To
  const [studentNames, setStudentNames] = useState<Map<string, string>>(new Map());
  const [staffNames, setStaffNames] = useState<Map<string, string>>(new Map());
  // Filters
  const [statusFilter, setStatusFilter] = useState<'All' | 'Issued' | 'Returned' | 'Overdue' | 'Lost' | 'Damaged'>('All');
  const [search, setSearch] = useState('');
  const [dueStart, setDueStart] = useState<string>('');
  const [dueEnd, setDueEnd] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const [c, overdueList] = await Promise.all([
          libraryService.getBookCounts(),
          libraryService.getOverdueBookIssues(),
        ]);
        if (!mounted) return;
  setCounts(prev => (c ?? prev));
  setOverdue(Array.isArray(overdueList) ? overdueList.length : 0);
      } catch (e) {
        // Keep silent; page still renders
        console.debug('Library counts not available yet', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load all book issues for reporting table
  const loadIssues = async () => {
    setLoadingIssues(true);
    try {
      const data = await libraryService.getAllBookIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch {
      setIssues([]);
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    loadIssues();
    loadAvailableBooks();
  }, []);

  // Load student and staff name maps for Issued To display
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [students, staff] = await Promise.all([
          studentService.getAllStudents().catch(() => []),
          staffService.getAll().catch(() => [])
        ]);
        if (!mounted) return;
        const sMap = new Map<string, string>();
        const tMap = new Map<string, string>();
        (students || []).forEach((s: any) => {
          if (s && (s.studentId || s.id)) {
            sMap.set(String(s.studentId || s.id), s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim());
          }
        });
        (staff || []).forEach((st: any) => {
          const idKey = String(st.staffId || st.id || '');
          if (idKey) {
            const fullName = st.fullName || `${st.firstName || ''} ${st.lastName || ''}`.trim();
            tMap.set(idKey, fullName || st.email || idKey);
          }
        });
        setStudentNames(sMap);
        setStaffNames(tMap);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const resolveIssueeName = (i: BookIssue) => {
    if (i.issueeName && i.issueeName.trim()) return i.issueeName;
    const key = String(i.issuedTo || '').trim();
    if (!key) return '-';
    const type = (i.issueType || '').toLowerCase();
    if (type === 'student') return studentNames.get(key) || key;
    if (type === 'staff') return staffNames.get(key) || key;
    // Unknown type: try either map
    return studentNames.get(key) || staffNames.get(key) || key;
  };

  const handleUpdateBookStatus = async (bookId?: number, newStatus?: BookStatus) => {
    if (!bookId || !newStatus) return;
    const confirm = window.confirm(`Mark this book as ${newStatus}?`);
    if (!confirm) return;
    setUpdatingBookId(bookId);
    try {
      const existing = await libraryService.getBookById(bookId);
      const payload: Book = { ...existing, status: newStatus } as Book;
      await libraryService.updateBook(bookId, payload);
      // Refresh counts, available list, and issues
      const [c, avail, iss] = await Promise.all([
        libraryService.getBookCounts(),
        libraryService.getBooksByStatus('Available').catch(() => []),
        libraryService.getAllBookIssues().catch(() => [])
      ]);
      setCounts(prev => (c ?? prev));
      setAvailableBooks(Array.isArray(avail) ? avail : []);
      setIssues(Array.isArray(iss) ? iss : []);
    } catch (e) {
      console.error('Failed to update book status', e);
      alert('Failed to update book status. Please try again.');
    } finally {
      setUpdatingBookId(null);
    }
  };

  const loadAvailableBooks = async () => {
    setLoadingAvailable(true);
    try {
      const list = await libraryService.getBooksByStatus('Available');
      setAvailableBooks(Array.isArray(list) ? list : []);
    } catch {
      setAvailableBooks([]);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const loadStatusBooks = async (status: 'Lost' | 'Damaged') => {
    setLoadingStatusBooks(true);
    try {
      const list = await libraryService.getBooksByStatus(status);
      setStatusBooks(Array.isArray(list) ? list : []);
    } catch {
      setStatusBooks([]);
    } finally {
      setLoadingStatusBooks(false);
    }
  };

  // Refresh book lists when the Status filter changes
  useEffect(() => {
    if (statusFilter === 'All') loadAvailableBooks();
    if (statusFilter === 'Lost' || statusFilter === 'Damaged') {
      loadStatusBooks(statusFilter);
    }
  }, [statusFilter]);

  const filteredIssues = useMemo(() => {
    return issues.filter(i => {
      if (statusFilter !== 'All') {
        if (statusFilter === 'Overdue') {
          const today = new Date().toISOString().slice(0, 10);
          // Overdue = not returned and dueDate before today
          if ((i.status || '').toLowerCase() !== 'issued') return false;
          if (!i.dueDate || i.dueDate >= today) return false;
        } else if ((i.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }
      if (search) {
        const s = search.toLowerCase();
        const title = (i.bookTitle || '').toLowerCase();
        const user = (i.issuedTo || '').toLowerCase();
        if (!title.includes(s) && !user.includes(s)) return false;
      }
      if (dueStart && i.dueDate && i.dueDate < dueStart) return false;
      if (dueEnd && i.dueDate && i.dueDate > dueEnd) return false;
      return true;
    });
  }, [issues, statusFilter, search, dueStart, dueEnd]);

  // Compute counts by title
  const availableByTitle = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of availableBooks) {
      const key = (b.title || '').trim().toLowerCase();
      if (!key) continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [availableBooks]);

  const issuedActiveByTitle = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of issues) {
      if ((it.status || '').toLowerCase() !== 'issued') continue;
      const key = (it.bookTitle || '').trim().toLowerCase();
      if (!key) continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [issues]);

  const filteredAvailableBooks = useMemo(() => {
    if (statusFilter !== 'All') return [];
    const s = (search || '').toLowerCase();
    if (!s) return availableBooks;
    return availableBooks.filter(b =>
      (b.title || '').toLowerCase().includes(s) ||
      (b.author || '').toLowerCase().includes(s) ||
      (b.category || '').toLowerCase().includes(s)
    );
  }, [availableBooks, statusFilter, search]);


  // downloadCsv removed

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>Library</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage books, issues/returns, and view quick stats.
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
  <Button size="small" variant="contained" onClick={(e) => setBookMenuAnchor(e.currentTarget)}>Add Books ▾</Button>
        <Menu
          anchorEl={bookMenuAnchor}
          open={Boolean(bookMenuAnchor)}
          onClose={() => setBookMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <MenuItem onClick={() => { setBookMenuAnchor(null); setShowAdd(true); }}>Add Book</MenuItem>
          <MenuItem onClick={() => { setBookMenuAnchor(null); setShowUpload(true); }}>Bulk Upload Books</MenuItem>
        </Menu>
        <Button size="small" variant="contained" onClick={() => setShowIssue(true)}>Issue Book</Button>
        <Button size="small" variant="outlined" onClick={() => setShowReturn(true)}>Return Book</Button>
        <Button size="small" variant="outlined" onClick={loadIssues} disabled={loadingIssues}>Refresh Issues</Button>
  {/* Download CSV removed as requested */}
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Books" value={counts.total || 0} icon={<LibraryBooksIcon color="primary" fontSize="small" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Available" value={counts.available || 0} icon={<LibraryBooksIcon color="success" fontSize="small" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Issued" value={counts.issued || 0} icon={<AssignmentReturnIcon color="secondary" fontSize="small" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Overdue" value={overdue || 0} icon={<AssessmentIcon color="warning" fontSize="small" />} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
  <Typography variant="h6" gutterBottom>Books</Typography>

  <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
      <TextField size="small" fullWidth label="Search (book or user)" value={search} onChange={(e) => setSearch(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
  <TextField size="small" select fullWidth label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Issued">Issued</MenuItem>
            <MenuItem value="Returned">Returned</MenuItem>
    <MenuItem value="Overdue">Overdue</MenuItem>
      <MenuItem value="Lost">Lost</MenuItem>
      <MenuItem value="Damaged">Damaged</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
      <TextField size="small" type="date" fullWidth label="Due start" value={dueStart} onChange={(e) => setDueStart(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
      <TextField size="small" type="date" fullWidth label="Due end" value={dueEnd} onChange={(e) => setDueEnd(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
      </Grid>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Book</TableCell>
            <TableCell>Issued To</TableCell>
            <TableCell>Issue Date</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Return Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Copies Issued</TableCell>
            <TableCell>Copies Available</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {statusFilter === 'All' && (
            <>
        {filteredAvailableBooks.map(b => (
                <TableRow key={`avail-${b.id}`}>
                  <TableCell>{b.title}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
          <TableCell>Available</TableCell>
             <TableCell>{issuedActiveByTitle.get((b.title || '').trim().toLowerCase()) || 0}</TableCell>
          <TableCell>{availableByTitle.get((b.title || '').trim().toLowerCase()) || 0}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" disabled={updatingBookId === b.id} onClick={() => handleUpdateBookStatus(b.id, BookStatus.LOST)}>Lost</Button>
                      <Button size="small" disabled={updatingBookId === b.id} onClick={() => handleUpdateBookStatus(b.id, BookStatus.DAMAGED)}>Damaged</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
        {filteredIssues.map(i => (
                <TableRow key={`issue-${i.id}`}>
                  <TableCell>{i.bookTitle || `Book ${i.bookId}`}</TableCell>
                  <TableCell>{resolveIssueeName(i)}</TableCell>
                  <TableCell>{i.issueDate}</TableCell>
                  <TableCell>{i.dueDate}</TableCell>
                  <TableCell>{i.returnDate || '-'}</TableCell>
          <TableCell>{i.status}</TableCell>
          <TableCell>{issuedActiveByTitle.get((i.bookTitle || '').trim().toLowerCase()) || 0}</TableCell>
          <TableCell>{availableByTitle.get((i.bookTitle || '').trim().toLowerCase()) || 0}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" disabled={updatingBookId === (i.bookId || 0)} onClick={() => handleUpdateBookStatus(i.bookId, BookStatus.LOST)}>Lost</Button>
                      <Button size="small" disabled={updatingBookId === (i.bookId || 0)} onClick={() => handleUpdateBookStatus(i.bookId, BookStatus.DAMAGED)}>Damaged</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
        {filteredAvailableBooks.length === 0 && filteredIssues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography variant="body2" color="text.secondary">No records found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
          {statusFilter !== 'All' && (statusFilter === 'Lost' || statusFilter === 'Damaged') && (
            <>
              {statusBooks
                .filter(b => {
                  if (search) {
                    const s = search.toLowerCase();
                    return (
                      (b.title || '').toLowerCase().includes(s) ||
                      (b.author || '').toLowerCase().includes(s) ||
                      (b.category || '').toLowerCase().includes(s)
                    );
                  }
                  return true;
                })
                .map(b => (
                <TableRow key={`status-${b.id}`}>
                  <TableCell>{b.title}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{b.status}</TableCell>
                  <TableCell>{issuedActiveByTitle.get((b.title || '').trim().toLowerCase()) || 0}</TableCell>
                  <TableCell>{availableByTitle.get((b.title || '').trim().toLowerCase()) || 0}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" disabled={updatingBookId === b.id} onClick={() => handleUpdateBookStatus(b.id, BookStatus.LOST)}>Lost</Button>
                      <Button size="small" disabled={updatingBookId === b.id} onClick={() => handleUpdateBookStatus(b.id, BookStatus.DAMAGED)}>Damaged</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {statusBooks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography variant="body2" color="text.secondary">No records found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
          {statusFilter !== 'All' && !(statusFilter === 'Lost' || statusFilter === 'Damaged') && (
            <>
        {filteredIssues.map(i => (
                <TableRow key={i.id}>
                  <TableCell>{i.bookTitle || `Book ${i.bookId}`}</TableCell>
                  <TableCell>{resolveIssueeName(i)}</TableCell>
                  <TableCell>{i.issueDate}</TableCell>
                  <TableCell>{i.dueDate}</TableCell>
                  <TableCell>{i.returnDate || '-'}</TableCell>
          <TableCell>{i.status}</TableCell>
          <TableCell>{issuedActiveByTitle.get((i.bookTitle || '').trim().toLowerCase()) || 0}</TableCell>
          <TableCell>{availableByTitle.get((i.bookTitle || '').trim().toLowerCase()) || 0}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" disabled={updatingBookId === (i.bookId || 0)} onClick={() => handleUpdateBookStatus(i.bookId, BookStatus.LOST)}>Lost</Button>
                      <Button size="small" disabled={updatingBookId === (i.bookId || 0)} onClick={() => handleUpdateBookStatus(i.bookId, BookStatus.DAMAGED)}>Damaged</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredIssues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography variant="body2" color="text.secondary">No records found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>


      <BulkBookUploadDialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUploaded={() => {
          // Refresh stats after upload
          Promise.all([
            libraryService.getBookCounts(),
            libraryService.getBooksByStatus('Available')
          ]).then(([c, list]) => {
            setCounts(prev => (c ?? prev));
            setAvailableBooks(Array.isArray(list) ? list : []);
          });
        }}
      />
      <AddBookDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={() => {
          Promise.all([
            libraryService.getBookCounts(),
            libraryService.getBooksByStatus('Available')
          ]).then(([c, list]) => {
            setCounts(prev => (c ?? prev));
            setAvailableBooks(Array.isArray(list) ? list : []);
          });
        }}
      />
      <IssueReturnDialog
        open={showIssue}
        onClose={() => setShowIssue(false)}
        onCompleted={() => {
          Promise.all([
            libraryService.getBookCounts(),
            libraryService.getOverdueBookIssues()
          ]).then(([c, o]) => {
            setCounts(prev => (c ?? prev));
            setOverdue(Array.isArray(o) ? o.length : 0);
          });
          loadIssues();
        }}
      />
      <ReturnBookDialog
        open={showReturn}
        onClose={() => setShowReturn(false)}
        onCompleted={() => {
          Promise.all([
            libraryService.getBookCounts(),
            libraryService.getOverdueBookIssues()
          ]).then(([c, o]) => {
            setCounts(prev => (c ?? prev));
            setOverdue(Array.isArray(o) ? o.length : 0);
          });
          loadIssues();
        }}
      />
      
    </Box>
  );
};

export default Library;
