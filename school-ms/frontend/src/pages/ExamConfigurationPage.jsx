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
import ExamManagementTab from './ExamManagementTab';
import ExamConfigTab from './ExamConfigTab';
import ManageSubjectsTab from './ManageSubjectsTab';


const ExamConfigurationPage = ({ apiBaseUrl }) => {
  const [selectedExam, setSelectedExam] = useState('');
  const [exams, setExams] = useState([]);
  // Reset selectedClass when selectedExam changes
  useEffect(() => {
    setSelectedClass('');
  }, [selectedExam]);
  // Fetch exams for BlueprintTab
  // getAuthHeaders is declared below, do not redeclare here

  // ...existing code...
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

  // Refetch exams whenever the Blueprint tab is selected
  useEffect(() => {
    if (tabIndex === 3) {
      fetch('/api/exams', {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then(r => r.ok ? r.json() : [])
        .then(setExams)
        .catch(() => setExams([]));
    }
  }, [tabIndex]);

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
        <Tab label="Exam Management" />
        <Tab label="Exam Configuration" />
        <Tab label="Manage Subjects" />
        <Tab label="Blueprint" />
      </Tabs>
      {tabIndex === 0 && <ExamManagementTab classes={classes} />}
      {tabIndex === 1 && (
        <ExamConfigTab
          classes={classes}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          subjects={subjects}
          newConfig={newConfig}
          setNewConfig={setNewConfig}
          handleConfigSave={handleConfigSave}
          configs={configs}
          setConfirmDialog={setConfirmDialog}
          error={error}
          setCopyDialog={setCopyDialog}
          copyDialog={copyDialog}
          copySource={copySource}
          setCopySource={setCopySource}
          copyTargets={copyTargets}
          setCopyTargets={setCopyTargets}
          handleCopyConfig={handleCopyConfig}
        />
      )}
      {tabIndex === 2 && (
        <ManageSubjectsTab
          subjectSearch={subjectSearch}
          setSubjectSearch={setSubjectSearch}
          subjectFeedback={subjectFeedback}
          setSubjectDialog={setSubjectDialog}
          setBulkDialog={setBulkDialog}
          bulkDialog={bulkDialog}
          handleBulkTemplateDownload={handleBulkTemplateDownload}
          fileInputRef={fileInputRef}
          handleBulkFileChange={handleBulkFileChange}
          bulkErrors={bulkErrors}
          bulkSubjects={bulkSubjects}
          handleBulkUpload={handleBulkUpload}
          subjects={subjects}
          setConfirmDialog={setConfirmDialog}
        />
      )}
      {tabIndex === 3 && (
        <BlueprintTab
          exams={exams}
          selectedExam={selectedExam}
          setSelectedExam={setSelectedExam}
          classes={classes}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          subjects={subjects}
        />
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
