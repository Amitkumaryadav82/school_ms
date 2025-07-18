import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';


import {
  Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Tabs, Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BlueprintTab from './BlueprintTab';


const ExamConfigurationPage = ({ apiBaseUrl }) => {
  // Always use /api as the base for backend requests
  const API_BASE = '/api';
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [configs, setConfigs] = useState([]);
  const [subjectDialog, setSubjectDialog] = useState({ open: false, mode: 'add', subject: { maxMarks: 100, theoryMarks: 100, practicalMarks: 0 } });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', payload: null });
  const [copyDialog, setCopyDialog] = useState(false);
  const [copySource, setCopySource] = useState('');
  const [copyTargets, setCopyTargets] = useState([]);
  const [newConfig, setNewConfig] = useState({ subjectId: '', maxMarks: '', theoryMarks: '', practicalMarks: '' });
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [subjectSearch, setSubjectSearch] = useState('');

  const [subjectFeedback, setSubjectFeedback] = useState('');

  // Bulk upload state and handlers
  const [bulkDialog, setBulkDialog] = useState(false);
  const [bulkSubjects, setBulkSubjects] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const fileInputRef = useRef();

  const handleBulkTemplateDownload = () => {
    window.open('/subject_bulk_template.csv', '_blank');
  };

  const handleBulkFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const errors = [];
        const codes = new Set();
        data.forEach((row, idx) => {
          if (!row.name || !row.code) errors.push(`Row ${idx + 2}: Name and Code are required.`);
          if (codes.has(row.code)) errors.push(`Row ${idx + 2}: Duplicate code in file: ${row.code}`);
          codes.add(row.code);
          if (isNaN(Number(row.max_marks)) || isNaN(Number(row.theory_marks)) || isNaN(Number(row.practical_marks))) {
            errors.push(`Row ${idx + 2}: Marks fields must be numbers.`);
          }
        });
        setBulkSubjects(data);
        setBulkErrors(errors);
      },
      error: (err) => setBulkErrors([err.message])
    });
  };

  const handleBulkUpload = async () => {
    setSubjectFeedback('');
    try {
      const payload = {
        subjects: bulkSubjects.map(s => ({
          name: s.name,
          code: s.code,
          description: s.description,
          maxMarks: Number(s.max_marks),
          theoryMarks: Number(s.theory_marks),
          practicalMarks: Number(s.practical_marks)
        })),
        expectedCount: bulkSubjects.length
      };
      const res = await fetch(`${API_BASE}/subjects/bulk`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Bulk upload failed');
      setBulkDialog(false);
      setBulkSubjects([]);
      setBulkErrors([]);
      setSubjectFeedback('Bulk upload successful!');
      // Refresh subjects
      fetch(`${API_BASE}/subjects`, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } })
        .then(r => r.ok ? r.json() : Promise.reject('Failed to load subjects'))
        .then(setSubjects);
    } catch (err) {
      setBulkErrors([err.message]);
    }
  };

  // Always get latest token for every request
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Fetch classes and subjects with error handling
  useEffect(() => {
    setError('');
    Promise.all([
      fetch(`${API_BASE}/classes`, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }).then(r => r.ok ? r.json() : Promise.reject('Failed to load classes')),
      fetch(`${API_BASE}/subjects`, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }).then(r => r.ok ? r.json() : Promise.reject('Failed to load subjects'))
    ])
      .then(([classesData, subjectsData]) => {
        setClasses(classesData);
        setSubjects(subjectsData);
      })
      .catch(err => {
        setError(typeof err === 'string' ? err : 'Unable to load initial data. Please try again later.');
      });
  }, [API_BASE]);

  // Fetch configs for selected class with error handling
  useEffect(() => {
    setError('');
    if (selectedClass) {
      fetch(`${API_BASE}/exam-configs?classId=${selectedClass}`, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } })
        .then(r => r.ok ? r.json() : Promise.reject('Failed to load exam configs'))
        .then(setConfigs)
        .catch(err => {
          setError(typeof err === 'string' ? err : 'Unable to load exam configs.');
        });
    } else {
      setConfigs([]);
    }
  }, [selectedClass, API_BASE]);

  // Add or update subject with error handling
  const handleSubjectSave = () => {
    const { id, name, code, description, maxMarks, theoryMarks, practicalMarks } = subjectDialog.subject;
    const m = parseInt(maxMarks) || 0;
    const t = parseInt(theoryMarks) || 0;
    const p = parseInt(practicalMarks) || 0;
    const payload = { name, code, description, maxMarks: m, theoryMarks: t, practicalMarks: p };
    console.log('[DEBUG] handleSubjectSave payload:', payload);
    if (!name || name.trim() === '') {
      setError('Subject name is required');
      return;
    }
    if (code && subjects.some(s => s.code === code && s.id !== id)) {
      setError('Subject code must be unique');
      return;
    }
    if (t + p !== m) {
      console.log('[Subject Save] Validation failed:', { m, t, p });
      setError('Theory + Practical must equal Max Marks');
      return;
    }
    const method = subjectDialog.mode === 'add' ? 'POST' : 'PUT';
    const url = subjectDialog.mode === 'add' ? `${API_BASE}/subjects` : `${API_BASE}/subjects/${id}`;
    fetch(url, {
      method,
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to save subject'))
      .then(() => {
        fetch(`${API_BASE}/subjects`, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }).then(r => r.ok ? r.json() : []).then(setSubjects);
        setSubjectDialog({ open: false, mode: 'add', subject: { maxMarks: 100, theoryMarks: 100, practicalMarks: 0 } });
        setError('');
        setSubjectFeedback(subjectDialog.mode === 'add' ? 'Subject added successfully.' : 'Subject updated successfully.');
        setTimeout(() => setSubjectFeedback(''), 2000);
      })
      .catch(err => {
        setError(typeof err === 'string' ? err : 'Unable to save subject.');
        setSubjectFeedback('');
      });
  };

  // Delete subject with error handling
  const handleDeleteSubject = id => {
    const subj = subjects.find(s => s.id === id);
    fetch(`${API_BASE}/subjects/${id}`, { method: 'DELETE', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } })
      .then(r => r.ok ? r : Promise.reject('Failed to delete subject'))
      .then(() => fetch(`${API_BASE}/subjects`, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }).then(r => r.ok ? r.json() : []).then(setSubjects))
      .then(() => {
        setSubjectFeedback(`Subject '${subj?.name || ''}' deleted.`);
        setTimeout(() => setSubjectFeedback(''), 2000);
      })
      .catch(err => {
        setError(typeof err === 'string' ? err : 'Unable to delete subject.');
        setSubjectFeedback('');
      });
  };

  // Add or update config with error handling
  const handleConfigSave = () => {
    const { subjectId, maxMarks, theoryMarks, practicalMarks } = newConfig;
    console.log('[Config Save] subjectId:', subjectId, 'maxMarks:', maxMarks, 'theoryMarks:', theoryMarks, 'practicalMarks:', practicalMarks);
    if (!subjectId || !maxMarks) return setError('Subject and max marks required');
    const t = parseInt(theoryMarks) || 0, p = parseInt(practicalMarks) || 0, m = parseInt(maxMarks);
    if (t + p !== m) {
      console.log('[Config Save] Validation failed:', { m, t, p });
      return setError('Theory + Practical must equal Max Marks');
    }
    fetch(`${API_BASE}/exam-configs`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolClass: { id: selectedClass },
        subject: { id: subjectId },
        maxMarks: m,
        theoryMarks: t,
        practicalMarks: p
      })
    })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to save configuration'))
      .then(() => {
        fetch(`${API_BASE}/exam-configs?classId=${selectedClass}`, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }).then(r => r.ok ? r.json() : []).then(setConfigs);
        setNewConfig({ subjectId: '', maxMarks: '', theoryMarks: '', practicalMarks: '' });
        setError('');
      })
      .catch(err => setError(typeof err === 'string' ? err : 'Unable to save configuration.'));
  };

  // Delete config with error handling
  const handleDeleteConfig = id => {
    fetch(`${API_BASE}/exam-configs/${id}`, { method: 'DELETE', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } })
      .then(r => r.ok ? r : Promise.reject('Failed to delete configuration'))
      .then(() => fetch(`${API_BASE}/exam-configs?classId=${selectedClass}`, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }).then(r => r.ok ? r.json() : []).then(setConfigs))
      .catch(err => setError(typeof err === 'string' ? err : 'Unable to delete configuration.'));
  };

  // Copy config with error handling
  const handleCopyConfig = () => {
    fetch(`${API_BASE}/exam-configs/copy`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceClassId: copySource, targetClassIds: copyTargets })
    })
      .then(r => r.ok ? r : Promise.reject('Failed to copy configuration'))
      .then(() => setCopyDialog(false))
      .catch(err => setError(typeof err === 'string' ? err : 'Unable to copy configuration.'));
  };

  // Fallback UI for error
  if (error) {
    return (
      <Box p={2}>
        <Typography variant="h5" gutterBottom>Exam Configuration</Typography>
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>Retry</Button>
      </Box>
    );
  }
  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>Examinations</Typography>
      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label="Exam Configuration" />
        <Tab label="Manage Subjects" />
        <Tab label="Blueprint" />
      </Tabs>
      {tabIndex === 0 && (
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
                          <IconButton onClick={() => setConfirmDialog({ open: true, type: 'deleteConfig', payload: cfg.id })}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </>
      )}
      {tabIndex === 1 && (
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
          <Dialog open={bulkDialog} onClose={() => { setBulkDialog(false); setBulkSubjects([]); setBulkErrors([]); }} maxWidth="md" fullWidth>
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
              <Button onClick={() => { setBulkDialog(false); setBulkSubjects([]); setBulkErrors([]); }}>Cancel</Button>
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
                      <IconButton onClick={() => setSubjectDialog({ open: true, mode: 'edit', subject: { ...subj, maxMarks: subj.maxMarks ?? 100, theoryMarks: subj.theoryMarks ?? subj.maxMarks ?? 100, practicalMarks: subj.practicalMarks ?? 0 } })}><EditIcon /></IconButton>
                      <IconButton onClick={() => setConfirmDialog({ open: true, type: 'deleteSubject', payload: subj.id })}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {tabIndex === 2 && (
        <BlueprintTab selectedClass={selectedClass} subjects={subjects} />
      )}
      {/* Subject Dialog */}
      <Dialog open={subjectDialog.open} onClose={() => setSubjectDialog({ open: false, mode: 'add', subject: { maxMarks: 100, theoryMarks: 100, practicalMarks: 0 } })}>
        <DialogTitle>{subjectDialog.mode === 'add' ? 'Add Subject' : 'Edit Subject'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={subjectDialog.subject.name || ''}
            onChange={e => setSubjectDialog({ ...subjectDialog, subject: { ...subjectDialog.subject, name: e.target.value } })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Code"
            value={subjectDialog.subject.code || ''}
            onChange={e => setSubjectDialog({ ...subjectDialog, subject: { ...subjectDialog.subject, code: e.target.value } })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={subjectDialog.subject.description || ''}
            onChange={e => setSubjectDialog({ ...subjectDialog, subject: { ...subjectDialog.subject, description: e.target.value } })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Max Marks"
            type="number"
            value={subjectDialog.subject.maxMarks ?? 100}
            onChange={e => {
              const val = parseInt(e.target.value) || 0;
              setSubjectDialog({
                ...subjectDialog,
                subject: {
                  ...subjectDialog.subject,
                  maxMarks: val,
                  theoryMarks: val,
                  practicalMarks: 0
                }
              });
            }}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Theory"
            type="number"
            value={subjectDialog.subject.theoryMarks ?? subjectDialog.subject.maxMarks ?? 100}
            onChange={e => {
              const val = parseInt(e.target.value) || 0;
              const max = subjectDialog.subject.maxMarks ?? 100;
              setSubjectDialog({
                ...subjectDialog,
                subject: {
                  ...subjectDialog.subject,
                  theoryMarks: val > max ? max : val,
                  practicalMarks: max - (val > max ? max : val)
                }
              });
            }}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Practical"
            type="number"
            value={subjectDialog.subject.practicalMarks ?? 0}
            onChange={e => {
              const val = parseInt(e.target.value) || 0;
              const max = subjectDialog.subject.maxMarks ?? 100;
              setSubjectDialog({
                ...subjectDialog,
                subject: {
                  ...subjectDialog.subject,
                  practicalMarks: val > max ? max : val,
                  theoryMarks: max - (val > max ? max : val)
                }
              });
            }}
            fullWidth
            margin="normal"
          />
          {error && <Typography color="error">{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubjectDialog({ open: false, mode: 'add', subject: { maxMarks: 100, theoryMarks: 100, practicalMarks: 0 } })}>Cancel</Button>
          <Button onClick={handleSubjectSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: '', payload: null })}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === 'deleteSubject'
              ? `Are you sure you want to delete subject '${subjects.find(s => s.id === confirmDialog.payload)?.name || ''}'?`
              : 'Are you sure you want to delete this configuration?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: '', payload: null })}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (confirmDialog.type === 'deleteSubject') handleDeleteSubject(confirmDialog.payload);
              else if (confirmDialog.type === 'deleteConfig') handleDeleteConfig(confirmDialog.payload);
              setConfirmDialog({ open: false, type: '', payload: null });
            }}
          >Delete</Button>
        </DialogActions>
      </Dialog>
      {/* Copy Config Dialog */}
      <Dialog open={copyDialog} onClose={() => setCopyDialog(false)}>
        <DialogTitle>Copy Configuration</DialogTitle>
        <DialogContent>
          <Select
            value={copySource}
            onChange={e => setCopySource(e.target.value)}
            displayEmpty
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value=""><em>Select Source Class</em></MenuItem>
            {classes.map(cls => (
              <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
            ))}
          </Select>
          <Typography>Select Target Classes:</Typography>
          <Box>
            {classes.filter(cls => cls.id !== copySource).map(cls => (
              <MenuItem
                key={cls.id}
                value={cls.id}
                onClick={() => setCopyTargets(
                  copyTargets.includes(cls.id)
                    ? copyTargets.filter(id => id !== cls.id)
                    : [...copyTargets, cls.id]
                )}
                selected={copyTargets.includes(cls.id)}
                sx={{ cursor: 'pointer', background: copyTargets.includes(cls.id) ? '#e3f2fd' : undefined }}
              >
                {cls.name}
              </MenuItem>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCopyConfig} disabled={!copySource || copyTargets.length === 0}>Copy</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ...existing code...

export default ExamConfigurationPage;
