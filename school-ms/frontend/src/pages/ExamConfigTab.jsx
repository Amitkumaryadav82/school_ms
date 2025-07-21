import React from 'react';
import { Box, Grid, Select, MenuItem, Button, Typography, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ExamConfigTab = ({
  classes,
  selectedClass,
  setSelectedClass,
  subjects,
  newConfig,
  setNewConfig,
  handleConfigSave,
  configs,
  setConfirmDialog,
  error,
  setCopyDialog,
  copyDialog,
  copySource,
  setCopySource,
  copyTargets,
  setCopyTargets,
  handleCopyConfig
}) => (
  <>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={4}>
        <Select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value=""><em>Select Class</em></MenuItem>
          {classes.map(cls => (
            <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid item xs={12} md={8}>
        <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={() => setCopyDialog(true)} disabled={!selectedClass}>
          Copy Configuration
        </Button>
      </Grid>
    </Grid>
    {selectedClass && (
      <>
        <Box mt={3} mb={2}>
          <Typography variant="h6">Assign Subject</Typography>
          <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" align="center">Subject</Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2" align="center">Max Marks</Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2" align="center">Theory</Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2" align="center">Practical</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Select
                value={newConfig.subjectId}
                onChange={e => {
                  const subjectId = e.target.value;
                  const subj = subjects.find(s => s.id === subjectId);
                  setNewConfig({
                    subjectId,
                    maxMarks: subj?.maxMarks ?? '',
                    theoryMarks: subj?.theoryMarks ?? '',
                    practicalMarks: subj?.practicalMarks ?? ''
                  });
                }}
                displayEmpty
                fullWidth
              >
                <MenuItem value=""><em>Select Subject</em></MenuItem>
                {subjects.map(subj => (
                  <MenuItem key={subj.id} value={subj.id}>{subj.name}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                type="number"
                value={newConfig.maxMarks}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                type="number"
                value={newConfig.theoryMarks}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                type="number"
                value={newConfig.practicalMarks}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button variant="contained" onClick={handleConfigSave}>Assign</Button>
            </Grid>
          </Grid>
          {error && <Typography color="error">{error}</Typography>}
        </Box>
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Max Marks</TableCell>
                <TableCell>Theory</TableCell>
                <TableCell>Practical</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.map(cfg => (
                <TableRow key={cfg.id}>
                  <TableCell>{cfg.subject.name}</TableCell>
                  <TableCell>{cfg.maxMarks}</TableCell>
                  <TableCell>{cfg.theoryMarks}</TableCell>
                  <TableCell>{cfg.practicalMarks}</TableCell>
                  <TableCell>
                    {/* If you want to add Edit, add handler here */}
                    <IconButton onClick={() => setConfirmDialog({ open: true, type: 'deleteConfig', payload: cfg.id })} size="small" aria-label="Delete">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    )}
  </>
);

export default ExamConfigTab;
