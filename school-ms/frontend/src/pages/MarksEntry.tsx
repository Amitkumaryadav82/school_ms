import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Student {
  id: number;
  name: string;
  rollNumber: string;
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Selection states
  const [grades, setGrades] = useState<number[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<number>(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number>(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number>(0);
  
  // Marks data
  const [studentMarks, setStudentMarks] = useState<StudentMarks | null>(null);
  
  // Dialog states
  const [absenceDialogOpen, setAbsenceDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<QuestionMark | null>(null);
  const [editReason, setEditReason] = useState('');
  
  // Marks lock state
  const [isLocked, setIsLocked] = useState(false);
  
  useEffect(() => {
    // Load grades (classes) for selection
    setGrades([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  }, []);
  
  // Load exams when grade changes
  useEffect(() => {
    if (selectedGrade) {
      const fetchExams = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/exams?grade=${selectedGrade}`);
          setExams(response.data);
          setSelectedExam(0); // Reset selection
          setSubjects([]);
          setStudents([]);
        } catch (err: any) {
          setError(err.message || 'Failed to load exams');
        } finally {
          setLoading(false);
        }
      };
      
      fetchExams();
    } else {
      setExams([]);
      setSelectedExam(0);
    }
  }, [selectedGrade]);
  
  // Load subjects when exam changes
  useEffect(() => {
    if (selectedExam) {
      const fetchSubjects = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/exams/${selectedExam}/subjects`);
          setSubjects(response.data);
          setSelectedSubject(0); // Reset selection
        } catch (err: any) {
          setError(err.message || 'Failed to load subjects');
        } finally {
          setLoading(false);
        }
      };
      
      const fetchStudents = async () => {
        try {
          setLoading(true);
          const exam = exams.find(e => e.id === selectedExam);
          if (exam) {
            const response = await api.get(`/api/students?grade=${exam.grade}`);
            setStudents(response.data);
            setSelectedStudent(0); // Reset selection
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load students');
        } finally {
          setLoading(false);
        }
      };
      
      fetchSubjects();
      fetchStudents();
    } else {
      setSubjects([]);
      setStudents([]);
      setSelectedSubject(0);
      setSelectedStudent(0);
    }
  }, [selectedExam, exams]);
  
  // Load marks data when student and subject are selected
  useEffect(() => {
    if (selectedStudent && selectedExam && selectedSubject) {
      const fetchMarks = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/exams/marks?studentId=${selectedStudent}&examId=${selectedExam}&subjectId=${selectedSubject}`);
          
          if (response.data) {
            setStudentMarks(response.data);
            // Check if marks are locked
            setIsLocked(response.data.isLocked || false);
          } else {
            // Create new marks object if none exists
            const student = students.find(s => s.id === selectedStudent);
            const subject = subjects.find(s => s.id === selectedSubject);
            
            if (student && subject) {
              // Fetch question structure to create empty marks entries
              const questionsResponse = await api.get(`/api/exams/${selectedExam}/papers/${selectedSubject}/questions`);
              
              const emptyMarks: StudentMarks = {
                studentId: student.id,
                studentName: student.name,
                rollNumber: student.rollNumber,
                examId: selectedExam,
                subjectId: selectedSubject,
                subjectName: subject.name,
                isAbsent: false,
                absenceReason: '',
                questionMarks: questionsResponse.data.map((q: any, index: number) => ({
                  questionId: q.id,
                  questionNumber: q.questionNumber || (index + 1),
                  questionType: q.questionType,
                  chapterName: q.chapterName,
                  maxMarks: q.marks,
                  obtainedMarks: 0,
                  evaluatorComments: ''
                })),
                totalTheoryMarks: 0,
                maxTheoryMarks: subject.maxTheoryMarks,
                totalPracticalMarks: 0,
                maxPracticalMarks: subject.maxPracticalMarks
              };
              
              setStudentMarks(emptyMarks);
              setIsLocked(false);
            }
          }
        } catch (err: any) {
          setError(err.message || 'Failed to load marks data');
          setStudentMarks(null);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMarks();
    } else {
      setStudentMarks(null);
    }
  }, [selectedStudent, selectedExam, selectedSubject, students, subjects]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleGradeChange = (event: SelectChangeEvent<number>) => {
    setSelectedGrade(event.target.value as number);
  };
  
  const handleExamChange = (event: SelectChangeEvent<number>) => {
    setSelectedExam(event.target.value as number);
  };
  
  const handleSubjectChange = (event: SelectChangeEvent<number>) => {
    setSelectedSubject(event.target.value as number);
  };
  
  const handleStudentChange = (event: SelectChangeEvent<number>) => {
    setSelectedStudent(event.target.value as number);
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
      await api.post('/api/exams/marks/edit', {
        marksId: `${studentMarks.studentId}_${studentMarks.examId}_${studentMarks.subjectId}_${editQuestion.questionId}`,
        newMarks: editQuestion.obtainedMarks,
        editReason: editReason
      });
      
      // Refresh marks data
      const response = await api.get(`/api/exams/marks?studentId=${selectedStudent}&examId=${selectedExam}&subjectId=${selectedSubject}`);
      setStudentMarks(response.data);
      
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
      
      await api.post('/api/exams/marks/lock', {
        examId: selectedExam,
        subjectId: selectedSubject,
        studentIds: [selectedStudent]
      });
      
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
  
  return (
    <Layout>
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="grade-select-label">Class/Grade</InputLabel>
                <Select
                  labelId="grade-select-label"
                  id="grade-select"
                  value={selectedGrade}
                  label="Class/Grade"
                  onChange={handleGradeChange}
                >
                  <MenuItem value={0}>Select Class</MenuItem>
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade}>Class {grade}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth disabled={!selectedGrade}>
                <InputLabel id="exam-select-label">Exam</InputLabel>
                <Select
                  labelId="exam-select-label"
                  id="exam-select"
                  value={selectedExam}
                  label="Exam"
                  onChange={handleExamChange}
                >
                  <MenuItem value={0}>Select Exam</MenuItem>
                  {exams.map((exam) => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.name} ({exam.examType})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth disabled={!selectedExam}>
                <InputLabel id="subject-select-label">Subject</InputLabel>
                <Select
                  labelId="subject-select-label"
                  id="subject-select"
                  value={selectedSubject}
                  label="Subject"
                  onChange={handleSubjectChange}
                >
                  <MenuItem value={0}>Select Subject</MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth disabled={!selectedExam || !selectedSubject}>
                <InputLabel id="student-select-label">Student</InputLabel>
                <Select
                  labelId="student-select-label"
                  id="student-select"
                  value={selectedStudent}
                  label="Student"
                  onChange={handleStudentChange}
                >
                  <MenuItem value={0}>Select Student</MenuItem>
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.rollNumber} - {student.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
        
        {loading ? (
          <Loading />
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
              
              {isLocked && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 16, 
                    display: 'flex',
                    alignItems: 'center',
                    color: 'warning.main'
                  }}
                >
                  <LockIcon sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    LOCKED
                  </Typography>
                </Box>
              )}
              
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
                                  {isLocked ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Typography>{question.obtainedMarks}</Typography>
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleEditDialogOpen(question)}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  ) : (
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
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isLocked ? (
                                    question.evaluatorComments
                                  ) : (
                                    <TextField
                                      value={question.evaluatorComments}
                                      onChange={(e) => handleCommentsChange(question.questionId, e.target.value)}
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                    />
                                  )}
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
                                    {isLocked ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography>{question.obtainedMarks}</Typography>
                                        <IconButton 
                                          size="small" 
                                          onClick={() => handleEditDialogOpen(question)}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    ) : (
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
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {isLocked ? (
                                      question.evaluatorComments
                                    ) : (
                                      <TextField
                                        value={question.evaluatorComments}
                                        onChange={(e) => handleCommentsChange(question.questionId, e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                      />
                                    )}
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
                  {!isLocked ? (
                    <>
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
                      <Grid item>
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<LockIcon />}
                          onClick={handleLockMarks}
                        >
                          Lock Marks
                        </Button>
                      </Grid>
                    </>
                  ) : (
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PrintIcon />}
                        onClick={() => {
                          // Add print functionality
                          window.print();
                        }}
                      >
                        Print
                      </Button>
                    </Grid>
                  )}
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
            
            {/* Edit Locked Marks Dialog */}
            <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
              <DialogTitle>Edit Locked Marks</DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                  Provide a reason for editing this mark after locking. This will be logged for review.
                </DialogContentText>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Question"
                      value={`Question ${editQuestion?.questionNumber} (${editQuestion?.chapterName})`}
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                      margin="dense"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Current Mark"
                      value={editQuestion?.obtainedMarks || 0}
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                      margin="dense"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="New Mark"
                      type="number"
                      inputProps={{ 
                        min: 0, 
                        max: editQuestion?.maxMarks || 0,
                        step: 0.5
                      }}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      value={editQuestion?.obtainedMarks || 0}
                      onChange={(e) => {
                        if (editQuestion) {
                          setEditQuestion({
                            ...editQuestion,
                            obtainedMarks: parseFloat(e.target.value) || 0
                          });
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Reason for Edit"
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      margin="dense"
                      required
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleEditDialogClose}>Cancel</Button>
                <Button 
                  onClick={handleEditLockedMark} 
                  variant="contained" 
                  color="primary"
                  disabled={!editReason.trim()}
                >
                  Save Changes
                </Button>
              </DialogActions>
            </Dialog>
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
    </Layout>
  );
};

export default MarksEntry;
