import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Box, Typography, TextField, Grid, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import dayjs from 'dayjs';
import { libraryService, BookIssue } from '../../services/libraryService';

type Props = {
  open: boolean;
  onClose: () => void;
};

const TabPanel: React.FC<React.PropsWithChildren<{ index: number; value: number }>> = ({ index, value, children }) => {
  if (value !== index) return null as any;
  return <Box sx={{ mt: 2 }}>{children}</Box>;
};

const LibraryReportsDialog: React.FC<Props> = ({ open, onClose }) => {
  const [tab, setTab] = useState(0);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [overdue, setOverdue] = useState<BookIssue[]>([]);
  const [category, setCategory] = useState<Record<string, number>>({});
  const [dueStart, setDueStart] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [dueEnd, setDueEnd] = useState<string>(dayjs().add(7, 'day').format('YYYY-MM-DD'));
  const [dueRange, setDueRange] = useState<BookIssue[]>([]);
  const [dateStart, setDateStart] = useState<string>(dayjs().subtract(14, 'day').format('YYYY-MM-DD'));
  const [dateEnd, setDateEnd] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [dateAnalysis, setDateAnalysis] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) return;
    // Load core reports
    libraryService.getInventorySummary().then(setInventory).catch(() => setInventory({}));
    libraryService.getOverdueBookIssues().then(setOverdue).catch(() => setOverdue([]));
    libraryService.getIssuedBooksCountByCategory().then(setCategory).catch(() => setCategory({}));
  }, [open]);

  const totalInventory = useMemo(() => Object.values(inventory).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0), [inventory]);

  const loadDueRange = async () => {
    try {
      const res = await libraryService.getBookIssuesDueInRange(dueStart, dueEnd);
      setDueRange(Array.isArray(res) ? res : []);
    } catch {
      setDueRange([]);
    }
  };

  const loadDateAnalysis = async () => {
    try {
      const res = await libraryService.getIssueCountByDateRange(dateStart, dateEnd);
      setDateAnalysis(res || {});
    } catch {
      setDateAnalysis({});
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Library Reports</DialogTitle>
      <DialogContent dividers>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
          <Tab label="Overview" />
          <Tab label="Overdue" />
          <Tab label="Due in Range" />
          <Tab label="By Category" />
          <Tab label="By Date" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <Grid container spacing={2}>
            {Object.entries(inventory).map(([k, v]) => (
              <Grid key={k} item xs={6} sm={4} md={3}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">{k}</Typography>
                  <Typography variant="h6">{v ?? 0}</Typography>
                </Box>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Total (sum of fields above): {totalInventory}</Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          {overdue.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No overdue issues.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Book</TableCell>
                  <TableCell>Issued To</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Issue Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overdue.map(i => (
                  <TableRow key={i.id}>
                    <TableCell>{i.bookTitle || `Book ${i.bookId}`}</TableCell>
                    <TableCell>{i.issuedTo}</TableCell>
                    <TableCell>{i.issueType}</TableCell>
                    <TableCell>{i.issueDate}</TableCell>
                    <TableCell>{i.dueDate}</TableCell>
                    <TableCell><Chip size="small" color="warning" label="Overdue" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField type="date" label="Start" value={dueStart} onChange={e => setDueStart(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField type="date" label="End" value={dueEnd} onChange={e => setDueEnd(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="outlined" onClick={loadDueRange}>Load</Button>
            </Grid>
          </Grid>
          {dueRange.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No issues due in the selected range.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Book</TableCell>
                  <TableCell>Issued To</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Issue Date</TableCell>
                  <TableCell>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dueRange.map(i => (
                  <TableRow key={i.id}>
                    <TableCell>{i.bookTitle || `Book ${i.bookId}`}</TableCell>
                    <TableCell>{i.issuedTo}</TableCell>
                    <TableCell>{i.issueType}</TableCell>
                    <TableCell>{i.issueDate}</TableCell>
                    <TableCell>{i.dueDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabPanel>

        <TabPanel value={tab} index={3}>
          {Object.keys(category).length === 0 ? (
            <Typography variant="body2" color="text.secondary">No data.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Issued Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(category).map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell>{k || 'Uncategorized'}</TableCell>
                    <TableCell align="right">{v ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabPanel>

        <TabPanel value={tab} index={4}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField type="date" label="Start" value={dateStart} onChange={e => setDateStart(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField type="date" label="End" value={dateEnd} onChange={e => setDateEnd(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="outlined" onClick={loadDateAnalysis}>Load</Button>
            </Grid>
          </Grid>
          {Object.keys(dateAnalysis).length === 0 ? (
            <Typography variant="body2" color="text.secondary">No data.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Issues</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(dateAnalysis).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell>{k}</TableCell>
                    <TableCell align="right">{v ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LibraryReportsDialog;
