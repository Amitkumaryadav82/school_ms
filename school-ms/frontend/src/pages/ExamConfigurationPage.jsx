import React, { useEffect, useState, useRef, useMemo } from 'react';
import Papa from 'papaparse';

import {
  Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Tabs, Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import BlueprintTab from './BlueprintTab';
import QuestionPaperFormatTab from './QuestionPaperFormatTab';
import ExamManagementTab from './ExamManagementTab';
import ExamConfigTab from './ExamConfigTab';
import ManageSubjectsTab from './ManageSubjectsTab';


const API_BASE = '/api';
const ExamConfigurationPage = ({ apiBaseUrl }) => {
  // State declarations at the top
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [classSubjects, setClassSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  // Fetch exam-config for selected class (consolidated)
  useEffect(() => {
    setError('');
    if (selectedClass && selectedClass !== '' && !isNaN(Number(selectedClass))) {
      fetch(`${API_BASE}/exam-configs?classId=${selectedClass}`, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then(r => r.ok ? r.json() : Promise.reject('Failed to load exam configs'))
        .then(data => {
          setClassSubjects(Array.isArray(data) ? data : []);
          setConfigs(Array.isArray(data) ? data : []);
          console.log('[QPF] examConfig for class', selectedClass, data);
        })
        .catch(err => {
          setClassSubjects([]);
          setConfigs([]);
          setError(typeof err === 'string' ? err : 'Unable to load exam configs.');
        });
    } else {
      setClassSubjects([]);
      setConfigs([]);
    }
  }, [selectedClass, API_BASE]);
  // Debug log: log exams state whenever it changes
  useEffect(() => {
    console.log('[DEBUG] exams state:', exams);
  }, [exams]);
  // Reset selectedClass and only populate classes after exam is selected
  useEffect(() => {
    setSelectedClass('');
  }, [selectedExam]);
  // Fetch exams for BlueprintTab
  // getAuthHeaders is declared below, do not redeclare here
  const [blueprintUnits, setBlueprintUnits] = useState([]);

  useEffect(() => {
    async function fetchBlueprintUnits() {
      if (selectedExam && selectedClass && selectedSubject) {
        try {
          const res = await fetch(`/api/blueprint?examId=${selectedExam}&classId=${selectedClass}&subjectId=${selectedSubject}`, {
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }
          });
          const data = await res.json();
          setBlueprintUnits(Array.isArray(data) ? data : []);
        } catch {
          setBlueprintUnits([]);
        }
      } else {
        setBlueprintUnits([]);
      }
    }
    fetchBlueprintUnits();
  }, [selectedExam, selectedClass, selectedSubject]);

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
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
    fetch('/api/exams', {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          console.log(`[API] /api/exams: count=${data.length}`, data.length > 0 ? data[0] : '(empty)');
        } else {
          console.log('[API] /api/exams: response not array', data);
        }
        setExams(data);
      })
      .catch(() => setExams([]));
  }, []);

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

  // Fetch subjects always, but fetch classes only for selected exam
  useEffect(() => {
    setError('');
    // Always fetch subjects
    fetch(`${API_BASE}/subjects`, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load subjects'))
      .then(setSubjects)
      .catch(err => setError(typeof err === 'string' ? err : 'Unable to load subjects.'));
  }, [API_BASE]);

  // Always fetch all classes on mount
  useEffect(() => {
    setError('');
    fetch(`${API_BASE}/classes`, { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load classes'))
      .then(data => {
        console.log('[DEBUG] /api/classes payload:', data);
        setClasses(data);
      })
      .catch(err => setError(typeof err === 'string' ? err : 'Unable to load classes.'));
  }, [API_BASE]);

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
      {/* Wrap the tab bar in a horizontally scrollable container */}
      <Box sx={{ overflowX: 'auto', whiteSpace: 'nowrap', width: '100%' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Examination Tabs"
          sx={{ minWidth: 600 }} // optional: ensures tabs don't collapse too much
        >
          <Tab label="Exam Management" />
          <Tab label="Exam Configuration" />
          <Tab label="Manage Subjects" />
          <Tab label="Blueprint" />
          <Tab label="Question Paper Format" />
        </Tabs>
      </Box>
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
          classes={(() => {
            const exam = exams.find(e => String(e.id) === String(selectedExam));
            const filtered = exam && exam.classIds ? classes.filter(cls => exam.classIds.includes(cls.id)) : [];
            return filtered;
          })()}
          selectedClass={selectedExam ? selectedClass : ''}
          setSelectedClass={setSelectedClass}
          subjects={subjects}
        />
      )}
      {tabIndex === 4 && (
        <QuestionPaperFormatTab
          exams={exams}
          classes={(() => {
            const exam = exams.find(e => String(e.id) === String(selectedExam));
            const filtered = exam && exam.classIds ? classes.filter(cls => exam.classIds.includes(cls.id)) : [];
            return filtered;
          })()}
          subjects={(() => {
            // Only filter if both arrays are loaded
            if (!subjects || !classSubjects) return [];
            const subjectIds = classSubjects.map(cfg => cfg.subject?.id).filter(Boolean);
            if (subjectIds.length === 0) {
              console.log('[QPF] No subjects linked to selected class.');
              return [];
            }
            const filtered = subjects.filter(subj => subjectIds.some(id => String(id) === String(subj.id)));
            console.log('[QPF] filtered subjects for dropdown:', filtered);
            return filtered;
          })()}
          selectedExam={selectedExam}
          setSelectedExam={setSelectedExam}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          blueprintUnits={blueprintUnits}
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

export default ExamConfigurationPage;
