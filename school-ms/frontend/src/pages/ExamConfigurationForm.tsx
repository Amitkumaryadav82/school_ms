import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate, useParams } from 'react-router-dom';
import { ROLES } from '../utils/constants';
import { apiCall } from '../utils/apiCall';

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Grade {
  id: number;
  name: string;
}

interface ExamConfigurationFormData {
  id?: number;
  name: string;
  description: string;
  examType: string;
  gradeLevels: number[];
  subjects: number[];
  totalMarks: number;
  passingMarks: number;
  startDate: Date | null;
  endDate: Date | null;
  academicYear: string;
  isPublished: boolean;
}

const initialFormData: ExamConfigurationFormData = {
  name: '',
  description: '',
  examType: '',
  gradeLevels: [],
  subjects: [],
  totalMarks: 100,
  passingMarks: 35,
  startDate: null,
  endDate: null,
  academicYear: new Date().getFullYear().toString(),
  isPublished: false
};

const ExamConfigurationForm: React.FC = () => {
  const [formData, setFormData] = useState<ExamConfigurationFormData>(initialFormData);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Fetch subjects and grades on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsData, gradesData] = await Promise.all([
          apiCall('/api/subjects', 'GET'),
          apiCall('/api/grades', 'GET')
        ]);
        
        setSubjects(subjectsData);
        setGrades(gradesData);
        
        // If we have an ID, fetch the exam configuration for editing
        if (id) {
          const examConfigData = await apiCall(`/api/exam/configurations/${id}`, 'GET');
          setFormData({
            ...examConfigData,
            startDate: examConfigData.startDate ? new Date(examConfigData.startDate) : null,
            endDate: examConfigData.endDate ? new Date(examConfigData.endDate) : null,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showAlert('Failed to load required data', 'error');
      }
    };
    
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear validation error when field is updated
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  
  const handleMultipleSelect = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear validation error when field is updated
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  
  const handleDateChange = (date: Date | null, fieldName: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: date }));
    
    // Clear validation error when field is updated
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Exam name is required';
    }
    
    if (!formData.examType) {
      newErrors.examType = 'Exam type is required';
    }
    
    if (formData.gradeLevels.length === 0) {
      newErrors.gradeLevels = 'At least one grade must be selected';
    }
    
    if (formData.subjects.length === 0) {
      newErrors.subjects = 'At least one subject must be selected';
    }
    
    if (formData.totalMarks <= 0) {
      newErrors.totalMarks = 'Total marks must be greater than 0';
    }
    
    if (formData.passingMarks < 0 || formData.passingMarks > formData.totalMarks) {
      newErrors.passingMarks = `Passing marks must be between 0 and ${formData.totalMarks}`;
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = 'Academic year is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const method = id ? 'PUT' : 'POST';
      const endpoint = id ? `/api/exam/configurations/${id}` : '/api/exam/configurations';
      
      const response = await apiCall(endpoint, method, formData);
      
      showAlert('Exam configuration saved successfully', 'success');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/exams');
      }, 1500);
    } catch (error) {
      console.error('Error saving exam configuration:', error);
      showAlert('Failed to save exam configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const showAlert = (message: string, severity: 'success' | 'error') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto', mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Exam Configuration' : 'Create New Exam Configuration'}
        </Typography>
        
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Exam Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.examType}>
                <InputLabel id="exam-type-label">Exam Type</InputLabel>
                <Select
                  labelId="exam-type-label"
                  name="examType"
                  value={formData.examType}
                  onChange={handleChange}
                  label="Exam Type"
                >
                  <MenuItem value="UNIT_TEST">Unit Test</MenuItem>
                  <MenuItem value="MID_TERM">Mid Term</MenuItem>
                  <MenuItem value="TERM_END">Term End</MenuItem>
                  <MenuItem value="FINAL">Final Exam</MenuItem>
                  <MenuItem value="PRACTICE">Practice Test</MenuItem>
                </Select>
                {errors.examType && <FormHelperText>{errors.examType}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.gradeLevels}>
                <InputLabel id="grades-label">Grade Levels</InputLabel>
                <Select
                  labelId="grades-label"
                  name="gradeLevels"
                  multiple
                  value={formData.gradeLevels}
                  onChange={handleMultipleSelect}
                  label="Grade Levels"
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.gradeLevels && <FormHelperText>{errors.gradeLevels}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.subjects}>
                <InputLabel id="subjects-label">Subjects</InputLabel>
                <Select
                  labelId="subjects-label"
                  name="subjects"
                  multiple
                  value={formData.subjects}
                  onChange={handleMultipleSelect}
                  label="Subjects"
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </MenuItem>
                  ))}
                </Select>
                {errors.subjects && <FormHelperText>{errors.subjects}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Total Marks"
                name="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={handleChange}
                error={!!errors.totalMarks}
                helperText={errors.totalMarks}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Passing Marks"
                name="passingMarks"
                type="number"
                value={formData.passingMarks}
                onChange={handleChange}
                error={!!errors.passingMarks}
                helperText={errors.passingMarks}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => handleDateChange(date, 'endDate')}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.endDate,
                    helperText: errors.endDate
                  }
                }}
                minDate={formData.startDate || undefined}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Academic Year"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                error={!!errors.academicYear}
                helperText={errors.academicYear}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isLoading}
                sx={{ mr: 2 }}
              >
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/exams')}
                size="large"
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default ExamConfigurationForm;
