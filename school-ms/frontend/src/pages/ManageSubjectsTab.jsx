import React from 'react';
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ManageSubjectsTab = ({
  subjectSearch,
  setSubjectSearch,
  subjectFeedback,
  setSubjectDialog,
  setBulkDialog,
  bulkDialog,
  handleBulkTemplateDownload,
  fileInputRef,
  handleBulkFileChange,
  bulkErrors,
  bulkSubjects,
  handleBulkUpload,
  subjects,
  setConfirmDialog
}) => (
  <Box>
    <Typography variant="h6">Manage Subjects</Typography>
    <Box display="flex" alignItems="center" mb={2} mt={1}>
      <TextField
        label="Search Subjects"
        value={subjectSearch}
        onChange={e => setSubjectSearch(e.target.value)}
        size="small"
        sx={{ mr: 2, width: 250 }}
      />
      <Button startIcon={<AddIcon />} onClick={() => setSubjectDialog({ open: true, mode: 'add', subject: { maxMarks: 100, theoryMarks: 100, practicalMarks: 0 } })} sx={{ mr: 2 }}>Add Subject</Button>
      <Button variant="outlined" onClick={() => setBulkDialog(true)}>Bulk Upload</Button>
      {subjectFeedback && <Typography color="success.main" sx={{ ml: 2 }}>{subjectFeedback}</Typography>}
    </Box>
    {/* Bulk Upload Dialog */}
    <Dialog open={bulkDialog} onClose={() => { setBulkDialog(false); }} maxWidth="md" fullWidth>
      <DialogTitle>Bulk Upload Subjects</DialogTitle>
      <DialogContent>
        <Button variant="outlined" onClick={handleBulkTemplateDownload} sx={{ mb: 2, mr: 2 }}>Download Template</Button>
        <Button variant="outlined" component="label" sx={{ mb: 2 }}>
          Select CSV File
          <input type="file" accept=".csv" hidden ref={fileInputRef} onChange={handleBulkFileChange} />
        </Button>
        {bulkErrors.length > 0 && (
          <Box color="error.main" mb={2}>
            {bulkErrors.map((err, i) => <div key={i}>{err}</div>)}
          </Box>
        )}
        {bulkSubjects.length > 0 && (
          <TableContainer component={Card} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Max Marks</TableCell>
                  <TableCell>Theory Marks</TableCell>
                  <TableCell>Practical Marks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bulkSubjects.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.max_marks}</TableCell>
                    <TableCell>{row.theory_marks}</TableCell>
                    <TableCell>{row.practical_marks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setBulkDialog(false)}>Cancel</Button>
        <Button onClick={handleBulkUpload} disabled={bulkErrors.length > 0 || bulkSubjects.length === 0} variant="contained">Upload</Button>
      </DialogActions>
    </Dialog>
    <TableContainer component={Card} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Max Marks</TableCell>
            <TableCell>Theory</TableCell>
            <TableCell>Practical</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subjects.filter(subj =>
            subj.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
            (subj.code || '').toLowerCase().includes(subjectSearch.toLowerCase())
          ).map(subj => (
            <TableRow key={subj.id}>
              <TableCell>{subj.name}</TableCell>
              <TableCell>{subj.code}</TableCell>
              <TableCell>{subj.description}</TableCell>
              <TableCell>{subj.maxMarks ?? 100}</TableCell>
              <TableCell>{subj.theoryMarks ?? subj.maxMarks ?? 100}</TableCell>
              <TableCell>{subj.practicalMarks ?? 0}</TableCell>
              <TableCell>
                <IconButton onClick={() => setSubjectDialog({ open: true, mode: 'edit', subject: { ...subj, maxMarks: subj.maxMarks ?? 100, theoryMarks: subj.theoryMarks ?? subj.maxMarks ?? 100, practicalMarks: subj.practicalMarks ?? 0 } })} size="small" aria-label="Edit">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => setConfirmDialog({ open: true, type: 'deleteSubject', payload: subj.id })} size="small" aria-label="Delete">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export default ManageSubjectsTab;
