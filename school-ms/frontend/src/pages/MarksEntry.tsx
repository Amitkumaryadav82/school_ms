import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
  Select,
    Snackbar,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  studentId?: string; // school roll/student code if present
}

interface Exam {
  id: number;
  name: string;
  examType: string;
  grade: number;
}

interface Subject {
  id: number;
  name: string;
  maxTheoryMarks: number;
  maxPracticalMarks: number;
  hasPractical: boolean;
}

interface ClassItem {
  id: number;
  name: string;
}

interface SectionItem {
  id: number;
  name: string;
}

interface QuestionMark {
  questionId: number;
  questionNumber: number;
  questionType: string;
  chapterName: string;
  maxMarks: number;
  obtainedMarks: number;
  evaluatorComments: string;
}

interface StudentMarks {
  studentId: number;
  studentName: string;
  rollNumber: string;
  examId: number;
  subjectId: number;
  subjectName: string;
  isAbsent: boolean;
  absenceReason: string;
  questionMarks: QuestionMark[];
  totalTheoryMarks: number;
  maxTheoryMarks: number;
  totalPracticalMarks: number;
  maxPracticalMarks: number;
}

// Matrix types (subjects across columns, students as rows)
interface MatrixSubject {
  subjectId: number;
  subjectName: string;
  totalMaxMarks: number; // QPF sum for validation
}
interface MatrixCell {
  subjectId: number;
  theoryMarks?: number;
  practicalMarks?: number;
  absent?: boolean;
  absenceReason?: string;
}
interface MatrixRow {
  studentId: number;
  studentName: string;
  rollNumber: string;
  cells: MatrixCell[];
}
interface MarksMatrixResponse {
  subjects: MatrixSubject[];
  students: MatrixRow[];
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MarksEntry: React.FC = () => {
  // Constants for special selections
  const ALL_SUBJECTS = -1;
  const ALL_STUDENTS = -1;
  // Layout constants for matrix table (used for sticky columns and min width)
  const STUDENT_COL_W = 240;
  const ROLL_COL_W = 120;
  const PER_MARK_COL_W = 80; // width per Th/Pr cell

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Selection states
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<number>(0);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number>(ALL_SUBJECTS);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number>(0);
  
  // Marks data
  const [studentMarks, setStudentMarks] = useState<StudentMarks | null>(null);
  // Matrix data
  const [matrixSubjects, setMatrixSubjects] = useState<MatrixSubject[]>([]);
  const [matrixRows, setMatrixRows] = useState<MatrixRow[]>([]);
  const [matrixLoading, setMatrixLoading] = useState(false);
  
  // Dialog states
  const [absenceDialogOpen, setAbsenceDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<QuestionMark | null>(null);
  const [editReason, setEditReason] = useState('');
  
  // Marks lock state
  const [isLocked, setIsLocked] = useState(false);
  
  // Load exams on mount
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
  const examsData = await api.get<Exam[]>('/api/exams');
  setExams(examsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load exams');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  // Load classes when exam changes
  useEffect(() => {
    if (selectedExam) {
    const fetchClasses = async () => {
        try {
          setLoading(true);
      const classesData = await api.get<ClassItem[]>(`/api/exam-configs/classes`);
          setClasses(classesData);
        } catch (err: any) {
          setError(err.message || 'Failed to load classes');
        } finally {
          setLoading(false);
        }
      };
      fetchClasses();
    } else {
      setClasses([]);
      setSelectedClass(0);
    }
  setSelectedClass(0);
  setSelectedSubject(ALL_SUBJECTS);
  setSelectedSection(0);
  setSelectedStudent(0);
    setSubjects([]);
    setSections([]);
    setStudents([]);
  }, [selectedExam]);

  // Load subjects and sections when class changes
  useEffect(() => {
    if (selectedClass) {
    const fetchSubjects = async () => {
        try {
          setLoading(true);
      const subjectsData = await api.get<Subject[]>(`/api/exam-configs/subjects`, { classId: selectedClass });
          setSubjects(subjectsData);
        } catch (err: any) {
          setError(err.message || 'Failed to load subjects');
        } finally {
          setLoading(false);
        }
      };
      const fetchSections = async () => {
        try {
          setLoading(true);
          // Backend returns string[] of section names; map to { id, name } for the UI
          const sectionsRaw = await api.get<string[]>(`/api/classes/${selectedClass}/sections`);
          const mapped: SectionItem[] = (sectionsRaw || []).map((name, idx) => ({ id: idx + 1, name }));
          setSections(mapped);
        } catch (err: any) {
          setError(err.message || 'Failed to load sections');
        } finally {
          setLoading(false);
        }
      };
      fetchSubjects();
      fetchSections();
    } else {
  setSubjects([]);
  setSections([]);
  setSelectedSubject(ALL_SUBJECTS);
      setSelectedSection(0);
      setSelectedStudent(0);
      setStudents([]);
    }
  }, [selectedClass]);

  // Load students when section changes
  useEffect(() => {
    if (selectedClass && selectedSection) {
      const fetchStudents = async () => {
        try {
          setLoading(true);
          // Derive grade number from selected class name (e.g., "Class 5" -> 5)
          const cls = classes.find(c => c.id === selectedClass);
          const gradeMatch = cls?.name?.match(/\d+/);
          const gradeNumber = gradeMatch ? parseInt(gradeMatch[0], 10) : undefined;
          const sectionObj = sections.find(s => s.id === selectedSection);
          const sectionName = sectionObj?.name;
          if (!gradeNumber || !sectionName) {
            setStudents([]);
            return;
          }
          const studentsData = await api.get<Student[]>(`/api/students/grade/${gradeNumber}/section/${encodeURIComponent(sectionName)}`);
          setStudents(studentsData);
        } catch (err: any) {
          setError(err.message || 'Failed to load students');
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
      setSelectedStudent(0);
    }
  }, [selectedSection, selectedClass, classes, sections]);

  // Load matrix when All Students + All Subjects are selected
  useEffect(() => {
    const isAllMode = selectedStudent === ALL_STUDENTS && selectedSubject === ALL_SUBJECTS;
    const hasBasics = selectedExam > 0 && selectedClass > 0 && selectedSection > 0;
    if (!isAllMode || !hasBasics) {
      setMatrixSubjects([]);
      setMatrixRows([]);
      return;
    }
    const fetchMatrix = async () => {
      try {
        setMatrixLoading(true);
        const cls = classes.find(c => c.id === selectedClass);
        const gradeMatch = cls?.name?.match(/\d+/);
        const gradeNumber = gradeMatch ? parseInt(gradeMatch[0], 10) : undefined;
        const sectionObj = sections.find(s => s.id === selectedSection);
        const sectionName = sectionObj?.name;
        if (!gradeNumber || !sectionName) return;
        const resp = await api.get<MarksMatrixResponse>(
          `/api/exams/marks/matrix`,
          { examId: selectedExam, classId: selectedClass, grade: gradeNumber, section: sectionName }
        );
        setMatrixSubjects(resp.subjects || []);
        // Normalize undefined values to 0 for editing convenience
        const norm = (resp.students || []).map(r => ({
          ...r,
          cells: (r.cells || []).map(cell => ({
            ...cell,
            theoryMarks: cell.theoryMarks ?? 0,
            practicalMarks: cell.practicalMarks ?? 0,
          }))
        }));
        setMatrixRows(norm);
      } catch (err: any) {
        setError(err.message || 'Failed to load marks matrix');
      } finally {
        setMatrixLoading(false);
      }
    };
    fetchMatrix();
  }, [selectedStudent, selectedSubject, selectedExam, selectedClass, selectedSection, classes, sections]);
  
  // Load marks when a specific student is selected (single-student mode)
  useEffect(() => {
    const canFetch = selectedExam > 0 && selectedSubject > 0 && selectedStudent > 0;
    if (!canFetch) {
      setStudentMarks(null);
      return;
    }
    const fetchMarks = async () => {
      try {
        setLoading(true);
  const marksData = await api.get<StudentMarks>(`/api/exams/marks?examId=${selectedExam}&classId=${selectedClass}&subjectId=${selectedSubject}&studentId=${selectedStudent}`);
        setStudentMarks(marksData || null);
        setIsLocked(false); // If backend returns lock state later, wire it here
      } catch (err: any) {
        setStudentMarks(null);
        setError(err.message || 'Failed to load marks');
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [selectedExam, selectedSubject, selectedStudent]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  
  const handleMarksChange = (questionId: number, value: number) => {
    if (!studentMarks || isLocked) return;
    
    const updatedMarks = { ...studentMarks };
    const questionIndex = updatedMarks.questionMarks.findIndex(q => q.questionId === questionId);
    
    if (questionIndex >= 0) {
      const question = updatedMarks.questionMarks[questionIndex];
      const maxMarks = question.maxMarks;
      
      // Ensure value is between 0 and max marks
      const validValue = Math.min(Math.max(0, value), maxMarks);
      updatedMarks.questionMarks[questionIndex].obtainedMarks = validValue;
      
      // Recalculate totals
      const theoryMarks = updatedMarks.questionMarks
        .filter(q => q.questionType === 'THEORY')
        .reduce((sum, q) => sum + q.obtainedMarks, 0);
        
      const practicalMarks = updatedMarks.questionMarks
        .filter(q => q.questionType === 'PRACTICAL')
        .reduce((sum, q) => sum + q.obtainedMarks, 0);
        
      updatedMarks.totalTheoryMarks = theoryMarks;
      updatedMarks.totalPracticalMarks = practicalMarks;
      
      setStudentMarks(updatedMarks);
    }
  };
  
  const handleCommentsChange = (questionId: number, comments: string) => {
    if (!studentMarks || isLocked) return;
    
    const updatedMarks = { ...studentMarks };
    const questionIndex = updatedMarks.questionMarks.findIndex(q => q.questionId === questionId);
    
    if (questionIndex >= 0) {
      updatedMarks.questionMarks[questionIndex].evaluatorComments = comments;
      setStudentMarks(updatedMarks);
    }
  };
  
  const handleAbsenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!studentMarks) return;
    
    const isAbsent = event.target.checked;
    
    if (isAbsent) {
      setAbsenceDialogOpen(true);
    } else {
      setStudentMarks({
        ...studentMarks,
        isAbsent: false,
        absenceReason: ''
      });
    }
  };
  
  const handleAbsenceDialogClose = (saveAbsence: boolean) => {
    if (saveAbsence && studentMarks) {
      setStudentMarks({
        ...studentMarks,
        isAbsent: true,
        // Zero out all marks when marked as absent
        questionMarks: studentMarks.questionMarks.map(q => ({
          ...q,
          obtainedMarks: 0
        })),
        totalTheoryMarks: 0,
        totalPracticalMarks: 0
      });
    }
    
    setAbsenceDialogOpen(false);
  };
  
  const handleEditDialogOpen = (question: QuestionMark) => {
    if (isLocked) {
      setEditQuestion(question);
      setEditDialogOpen(true);
    }
  };
  
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditQuestion(null);
    setEditReason('');
  };
  
  const handleEditLockedMark = async () => {
    if (!editQuestion || !studentMarks) return;
    
    try {
      setLoading(true);
      
      // Call API to edit locked marks
  await api.post(`/api/exams/marks/edit?examId=${selectedExam}&subjectId=${selectedSubject}&studentId=${selectedStudent}&questionFormatId=${editQuestion.questionId}&newMarks=${editQuestion.obtainedMarks}&reason=${encodeURIComponent(editReason)}`);
      
      // Refresh marks data
  const marksData = await api.get<StudentMarks>(`/api/exams/marks?examId=${selectedExam}&classId=${selectedClass}&subjectId=${selectedSubject}&studentId=${selectedStudent}`);
  setStudentMarks(marksData);
      
      setSuccess('Mark updated successfully');
      handleEditDialogClose();
      
    } catch (err: any) {
      setError(err.message || 'Failed to update marks');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveMarks = async () => {
    if (!studentMarks) return;
    
    try {
      setLoading(true);
      
      await api.post('/api/exams/marks', studentMarks);
      
      setSuccess('Marks saved successfully');
      
    } catch (err: any) {
      setError(err.message || 'Failed to save marks');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLockMarks = async () => {
    if (!studentMarks) return;
    
    try {
      setLoading(true);
      
  await api.post(`/api/exams/marks/lock?examId=${selectedExam}&subjectId=${selectedSubject}`, [selectedStudent]);
      
      setIsLocked(true);
      setSuccess('Marks locked successfully');
      
    } catch (err: any) {
      setError(err.message || 'Failed to lock marks');
    } finally {
      setLoading(false);
    }
  };
  
  const handleErrorClose = () => {
    setError(null);
  };
  
  const handleSuccessClose = () => {
    setSuccess(null);
  };
  
  // Bulk actions (All Students)
  const handleBulkLockAll = async () => {
    try {
      setLoading(true);
      const ids = students.map(s => s.id);
      await api.post(`/api/exams/marks/lock?examId=${selectedExam}&subjectId=${selectedSubject}`, ids);
      setSuccess('All students locked successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to lock all');
    } finally {
      setLoading(false);
    }
  };

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('studentId,questionId,obtainedMarks\n');
  const openBulkDialog = () => setBulkDialogOpen(true);
  const closeBulkDialog = () => setBulkDialogOpen(false);
  const handleBulkUpload = async () => {
    // Placeholder: ask for confirmation on CSV format before implementing parse + API calls
    setError('Please confirm preferred bulk upload format (CSV with columns: studentId,questionId,obtainedMarks)');
    setBulkDialogOpen(false);
  };
  
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Exam Marks Entry
      </Typography>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleSuccessClose}>
        <Alert onClose={handleSuccessClose} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          {/* Exam dropdown */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel id="exam-select-label">Exam</InputLabel>
              <Select
                labelId="exam-select-label"
                id="exam-select"
                value={selectedExam}
                label="Exam"
                onChange={e => setSelectedExam(Number(e.target.value))}
              >
                <MenuItem value={0}>Select Exam</MenuItem>
                {exams.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>{exam.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Class dropdown */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth disabled={!selectedExam}>
              <InputLabel id="class-select-label">Class</InputLabel>
              <Select
                labelId="class-select-label"
                id="class-select"
                value={selectedClass}
                label="Class"
                onChange={e => setSelectedClass(Number(e.target.value))}
              >
                <MenuItem value={0}>Select Class</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Section dropdown */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth disabled={!selectedClass}>
              <InputLabel id="section-select-label">Section</InputLabel>
              <Select
                labelId="section-select-label"
                id="section-select"
                value={selectedSection}
                label="Section"
                onChange={e => setSelectedSection(Number(e.target.value))}
              >
                <MenuItem value={0}>Select Section</MenuItem>
                {sections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>{section.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Subject dropdown (moved just before Student) */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth disabled={!selectedClass}>
              <InputLabel id="subject-select-label">Subject</InputLabel>
              <Select
                labelId="subject-select-label"
                id="subject-select"
                value={selectedSubject}
                label="Subject"
                onChange={e => setSelectedSubject(Number(e.target.value))}
              >
                <MenuItem value={ALL_SUBJECTS}>All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Student dropdown */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth disabled={!selectedSection}>
              <InputLabel id="student-select-label">Student</InputLabel>
              <Select
                labelId="student-select-label"
                id="student-select"
                value={selectedStudent}
                label="Student"
                onChange={e => setSelectedStudent(Number(e.target.value))}
              >
                <MenuItem value={0}>Select Student</MenuItem>
                <MenuItem value={ALL_STUDENTS}>All Students</MenuItem>
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
        
        {loading ? (
          <Loading />
        ) : selectedStudent === -1 ? (
          <>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <Typography variant="h6">All Students - {matrixRows.length || students.length} found</Typography>
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary" startIcon={<SaveIcon />} disabled={matrixRows.length === 0} onClick={async () => {
                    try {
                      setLoading(true);
                      // Build save request
                      const rowsPayload = matrixRows.map(r => ({
                        studentId: r.studentId,
                        subjects: matrixSubjects.map(s => {
                          const cell = r.cells.find(c => c.subjectId === s.subjectId) || { subjectId: s.subjectId } as MatrixCell;
                          const theory = cell.theoryMarks ?? 0;
                          const practical = cell.practicalMarks ?? 0;
                          // Client-side validation: sum <= total
                          if (theory + practical > (s.totalMaxMarks || 0)) {
                            throw new Error(`Marks exceed total for ${s.subjectName} for ${r.studentName}`);
                          }
                          return {
                            subjectId: s.subjectId,
                            theoryMarks: theory,
                            practicalMarks: practical,
                          };
                        })
                      }));
                      await api.post('/api/exams/marks/matrix', {
                        examId: selectedExam,
                        classId: selectedClass,
                        rows: rowsPayload,
                      });
                      setSuccess('All marks saved');
                    } catch (err: any) {
                      setError(err.message || 'Failed to save matrix');
                    } finally {
                      setLoading(false);
                    }
                  }}>Save All</Button>
                </Grid>
                {/* Optional: keep bulk upload for later */}
                {/* <Grid item>
                  <Button variant="outlined" onClick={openBulkDialog}>Bulk Upload</Button>
                </Grid> */}
              </Grid>
            </Paper>
            <Paper>
              {matrixLoading ? (
                <Loading />
              ) : matrixSubjects.length === 0 ? (
                <Box p={3}>
                  <Typography color="text.secondary" align="center">No subjects found with Question Paper Format for this exam and class.</Typography>
                </Box>
              ) : (
                <>
                  {/* Inform user if some subjects are not shown due to missing QPF */}
                  {(() => {
                    const ids = new Set(matrixSubjects.map(s => s.subjectId));
                    const missing = subjects.filter(s => !ids.has(s.id));
                    return missing.length > 0 ? (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        {`Hidden ${missing.length} subject(s) without Question Paper Format for this exam and class: ${missing.map(m => m.name).join(', ')}`}
                      </Alert>
                    ) : null;
                  })()}
                  <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table
                    size="small"
                    stickyHeader
                    sx={{
                      // Ensure horizontal scroll appears when subjects exceed available width
                      minWidth: STUDENT_COL_W + ROLL_COL_W + (matrixSubjects.length * 2 * PER_MARK_COL_W)
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          rowSpan={2}
                          sx={{
                            fontWeight: 600,
                            position: 'sticky',
                            left: 0,
                            zIndex: 3,
                            minWidth: STUDENT_COL_W,
                            width: STUDENT_COL_W,
                            backgroundColor: 'background.paper'
                          }}
                        >
                          Student
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          sx={{
                            fontWeight: 600,
                            position: 'sticky',
                            left: STUDENT_COL_W,
                            zIndex: 3,
                            minWidth: ROLL_COL_W,
                            width: ROLL_COL_W,
                            backgroundColor: 'background.paper'
                          }}
                        >
                          Roll
                        </TableCell>
                        {matrixSubjects.map(sub => (
                          <TableCell key={sub.subjectId} align="center" colSpan={2} sx={{ fontWeight: 600 }}>
                            {sub.subjectName} {sub.totalMaxMarks ? `(Max ${sub.totalMaxMarks})` : ''}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        {matrixSubjects.map(sub => (
                          <React.Fragment key={`hdr-${sub.subjectId}`}>
                            <TableCell align="center">Th</TableCell>
                            <TableCell align="center">Pr</TableCell>
                          </React.Fragment>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {matrixRows.map((row, rIdx) => (
                        <TableRow key={row.studentId} hover>
                          <TableCell
                            sx={{
                              position: 'sticky',
                              left: 0,
                              zIndex: 2,
                              minWidth: STUDENT_COL_W,
                              width: STUDENT_COL_W,
                              backgroundColor: 'background.paper'
                            }}
                          >
                            {row.studentName}
                          </TableCell>
                          <TableCell
                            sx={{
                              position: 'sticky',
                              left: STUDENT_COL_W,
                              zIndex: 2,
                              minWidth: ROLL_COL_W,
                              width: ROLL_COL_W,
                              backgroundColor: 'background.paper'
                            }}
                          >
                            {row.rollNumber || ''}
                          </TableCell>
                          {matrixSubjects.map((sub, cIdx) => {
                            const cell = row.cells.find(c => c.subjectId === sub.subjectId) || { subjectId: sub.subjectId } as MatrixCell;
                            const sum = (cell.theoryMarks ?? 0) + (cell.practicalMarks ?? 0);
                            const over = sum > (sub.totalMaxMarks || 0);
                            const updateCell = (patch: Partial<MatrixCell>) => {
                              setMatrixRows(prev => prev.map((rr, i) => i === rIdx ? {
                                ...rr,
                                cells: (() => {
                                  const existing = rr.cells.find(x => x.subjectId === sub.subjectId);
                                  if (existing) {
                                    return rr.cells.map(x => x.subjectId === sub.subjectId ? { ...x, ...patch } : x);
                                  }
                                  return [...rr.cells, { subjectId: sub.subjectId, theoryMarks: 0, practicalMarks: 0, ...patch }];
                                })()
                              } : rr));
                            };
                            return (
                              <React.Fragment key={`${row.studentId}-${sub.subjectId}`}>
                <TableCell align="center" sx={{ minWidth: PER_MARK_COL_W, width: PER_MARK_COL_W }}>
                                  <TextField
                                    type="number"
                                    inputProps={{ min: 0, step: 0.5, style: { textAlign: 'center' } }}
                                    value={cell.theoryMarks ?? 0}
                                    error={over}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      updateCell({ theoryMarks: isNaN(val) ? 0 : val });
                                    }}
                                    variant="outlined"
                                    size="small"
                  sx={{ width: 72 }}
                                  />
                                </TableCell>
                <TableCell align="center" sx={{ minWidth: PER_MARK_COL_W, width: PER_MARK_COL_W }}>
                                  <TextField
                                    type="number"
                                    inputProps={{ min: 0, step: 0.5, style: { textAlign: 'center' } }}
                                    value={cell.practicalMarks ?? 0}
                                    error={over}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      updateCell({ practicalMarks: isNaN(val) ? 0 : val });
                                    }}
                                    variant="outlined"
                                    size="small"
                  sx={{ width: 72 }}
                                  />
                                </TableCell>
                              </React.Fragment>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </TableContainer>
                </>
              )}
            </Paper>

            {/* Bulk Upload Dialog (optional, currently hidden) */}
            <Dialog open={bulkDialogOpen} onClose={closeBulkDialog} maxWidth="sm" fullWidth>
              <DialogTitle>Bulk Upload Marks</DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                  Paste CSV with columns: studentId,questionId,obtainedMarks for Exam {selectedExam}, Class {selectedClass}.
                </DialogContentText>
                <TextField
                  label="CSV"
                  fullWidth
                  multiline
                  rows={8}
                  value={bulkCsvText}
                  onChange={(e) => setBulkCsvText(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={closeBulkDialog}>Cancel</Button>
                <Button variant="contained" onClick={handleBulkUpload}>Upload</Button>
              </DialogActions>
            </Dialog>
          </>
        ) : studentMarks ? (
          <>
            <Paper sx={{ mb: 3, position: 'relative' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="marks entry tabs"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Theory Marks" />
                {subjects.find(s => s.id === selectedSubject)?.hasPractical && (
                  <Tab label="Practical Marks" />
                )}
              </Tabs>
              
              {/* Lock badge removed: edits allowed anytime */}
              
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={studentMarks.isAbsent}
                          onChange={handleAbsenceChange}
                          disabled={isLocked}
                        />
                      }
                      label="Student Absent"
                    />
                  </Grid>
                  
                  {studentMarks.isAbsent && (
                    <Grid item xs>
                      <Typography variant="body2" color="text.secondary">
                        Reason: {studentMarks.absenceReason || 'Not specified'}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                
                <TabPanel value={tabValue} index={0}>
                  {!studentMarks.isAbsent && (
                    <TableContainer>
                      <Table sx={{ minWidth: 650 }} size="small" aria-label="theory marks table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Q. No</TableCell>
                            <TableCell>Chapter</TableCell>
                            <TableCell align="center">Max Marks</TableCell>
                            <TableCell align="center">Marks Obtained</TableCell>
                            <TableCell>Comments</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {studentMarks.questionMarks
                            .filter(q => q.questionType === 'THEORY')
                            .map((question) => (
                              <TableRow key={question.questionId}>
                                <TableCell>{question.questionNumber}</TableCell>
                                <TableCell>{question.chapterName}</TableCell>
                                <TableCell align="center">{question.maxMarks}</TableCell>
                                <TableCell align="center">
                                  <TextField
                                      type="number"
                                      inputProps={{ 
                                        min: 0, 
                                        max: question.maxMarks,
                                        step: 0.5,
                                        style: { textAlign: 'center' } 
                                      }}
                                      value={question.obtainedMarks}
                                      onChange={(e) => handleMarksChange(question.questionId, parseFloat(e.target.value))}
                                      variant="outlined"
                                      size="small"
                                      sx={{ width: '80px' }}
                                    />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                      value={question.evaluatorComments}
                                      onChange={(e) => handleCommentsChange(question.questionId, e.target.value)}
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                    />
                                </TableCell>
                              </TableRow>
                            ))}
                            
                          <TableRow sx={{ '& td, & th': { fontWeight: 'bold' } }}>
                            <TableCell colSpan={2}>Total</TableCell>
                            <TableCell align="center">{studentMarks.maxTheoryMarks}</TableCell>
                            <TableCell align="center">{studentMarks.totalTheoryMarks}</TableCell>
                            <TableCell>
                              {(studentMarks.totalTheoryMarks / studentMarks.maxTheoryMarks * 100).toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </TabPanel>
                
                {subjects.find(s => s.id === selectedSubject)?.hasPractical && (
                  <TabPanel value={tabValue} index={1}>
                    {!studentMarks.isAbsent && (
                      <TableContainer>
                        <Table sx={{ minWidth: 650 }} size="small" aria-label="practical marks table">
                          <TableHead>
                            <TableRow>
                              <TableCell>Q. No</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell align="center">Max Marks</TableCell>
                              <TableCell align="center">Marks Obtained</TableCell>
                              <TableCell>Comments</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {studentMarks.questionMarks
                              .filter(q => q.questionType === 'PRACTICAL')
                              .map((question) => (
                                <TableRow key={question.questionId}>
                                  <TableCell>{question.questionNumber}</TableCell>
                                  <TableCell>{question.chapterName}</TableCell>
                                  <TableCell align="center">{question.maxMarks}</TableCell>
                  <TableCell align="center">
                    <TextField
                                        type="number"
                                        inputProps={{ 
                                          min: 0, 
                                          max: question.maxMarks,
                                          step: 0.5,
                                          style: { textAlign: 'center' } 
                                        }}
                                        value={question.obtainedMarks}
                                        onChange={(e) => handleMarksChange(question.questionId, parseFloat(e.target.value))}
                                        variant="outlined"
                                        size="small"
                                        sx={{ width: '80px' }}
                    />
                                  </TableCell>
                                  <TableCell>
                    <TextField
                                        value={question.evaluatorComments}
                                        onChange={(e) => handleCommentsChange(question.questionId, e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                              
                            <TableRow sx={{ '& td, & th': { fontWeight: 'bold' } }}>
                              <TableCell colSpan={2}>Total</TableCell>
                              <TableCell align="center">{studentMarks.maxPracticalMarks}</TableCell>
                              <TableCell align="center">{studentMarks.totalPracticalMarks}</TableCell>
                              <TableCell>
                                {(studentMarks.totalPracticalMarks / studentMarks.maxPracticalMarks * 100).toFixed(2)}%
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </TabPanel>
                )}
                
                <Grid container spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveMarks}
                    >
                      Save Marks
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
            
            {/* Absence Reason Dialog */}
            <Dialog open={absenceDialogOpen} onClose={() => handleAbsenceDialogClose(false)}>
              <DialogTitle>Student Absence</DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                  Please provide a reason for the student's absence.
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Reason"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                  value={studentMarks.absenceReason}
                  onChange={(e) => {
                    if (studentMarks) {
                      setStudentMarks({
                        ...studentMarks,
                        absenceReason: e.target.value
                      });
                    }
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => handleAbsenceDialogClose(false)}>Cancel</Button>
                <Button onClick={() => handleAbsenceDialogClose(true)} variant="contained">
                  Confirm Absence
                </Button>
              </DialogActions>
            </Dialog>
            
            {/* Edit Locked Marks Dialog removed: edits allowed anytime */}
          </>
        ) : (
          selectedStudent > 0 && selectedExam > 0 && selectedSubject > 0 ? (
            <Paper sx={{ p: 3 }}>
              <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
                No marks data found. Please enter marks for this student.
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
                Please select a class, exam, subject and student to enter marks.
              </Typography>
            </Paper>
          )
        )}


      </Box>
  );
}
export default MarksEntry;
