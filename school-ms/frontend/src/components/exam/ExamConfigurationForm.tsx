import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  TextField,
  Select,
  MenuItem,
  Stack, 
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
  Grid,
  IconButton,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ExamConfiguration, ExamType } from '../../services/examService';
import { examService } from '../../services/examService';
import QuestionPaperStructureForm from './QuestionPaperStructureForm';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

interface ExamConfigurationFormProps {
  initialData?: ExamConfiguration;
  onSubmitSuccess?: (config: ExamConfiguration) => void;
}

const ExamConfigurationForm: React.FC<ExamConfigurationFormProps> = ({ initialData, onSubmitSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExamConfiguration>({
    name: '',
    subject: '',
    grade: 0,
    theoryMaxMarks: 70,
    practicalMaxMarks: 30,
    passingPercentage: 33,
    examType: ExamType.MIDTERM,
    isActive: true,
    requiresApproval: true,
    approvalStatus: 'PENDING' as any,
    academicYear: new Date().getFullYear(),
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(value) ? 0 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleQuestionPaperStructureChange = (questionPaperStructure: any) => {
    setFormData(prev => ({
      ...prev,
      questionPaperStructure
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;
      if (initialData?.id) {
        response = await examService.updateExamConfiguration(initialData.id, formData);
        enqueueSnackbar('Exam configuration has been updated successfully', { variant: 'success' });
      } else {
        response = await examService.createExamConfiguration(formData);
        enqueueSnackbar('Exam configuration has been created successfully', { variant: 'success' });
      }

      if (onSubmitSuccess && response) {
        onSubmitSuccess(response as any);
      }
    } catch (error) {
      enqueueSnackbar('Failed to save exam configuration', { variant: 'error' });
      console.error('Error saving exam configuration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} p={4} border="1px solid #e0e0e0" borderRadius={2} boxShadow={2}>
      <Box display="flex" alignItems="center" mb={4} gap={2}>
        <IconButton 
          aria-label="Back" 
          onClick={() => navigate(-1)} 
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">
          {initialData?.id ? 'Edit Exam Configuration' : 'Create New Exam Configuration'}
        </Typography>
      </Box>
      
      <Stack spacing={4}>
        <FormControl required>
          <FormLabel>Configuration Name</FormLabel>
          <TextField 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g., First Term Maths Exam 2025"
            fullWidth
          />
        </FormControl>

        <FormControl required>
          <FormLabel>Subject</FormLabel>
          <TextField 
            name="subject" 
            value={formData.subject} 
            onChange={handleChange} 
            placeholder="e.g., Mathematics"
            fullWidth
          />
        </FormControl>

        <FormControl required>
          <FormLabel>Grade/Class</FormLabel>
          <Select name="grade" value={formData.grade} onChange={handleSelectChange} fullWidth>
            {[...Array(12)].map((_, i) => (
              <MenuItem key={i+1} value={i+1}>{i+1}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl required>
          <FormLabel>Exam Type</FormLabel>
          <Select name="examType" value={formData.examType} onChange={handleSelectChange} fullWidth>
            {Object.entries(ExamType).map(([key, value]) => (
              <MenuItem key={key} value={value}>{key}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl required>
          <FormLabel>Academic Year</FormLabel>
          <TextField 
            type="number"
            name="academicYear"
            value={formData.academicYear} 
            onChange={handleNumberChange('academicYear')}
            inputProps={{ min: 2000, max: 2100 }}
            fullWidth
          />
        </FormControl>

        <Typography variant="h6" mt={4}>Marks Distribution</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl required fullWidth>
              <FormLabel>Theory Max Marks</FormLabel>
              <TextField 
                type="number"
                name="theoryMaxMarks"
                value={formData.theoryMaxMarks} 
                onChange={handleNumberChange('theoryMaxMarks')}
                inputProps={{ min: 0 }}
                fullWidth
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl required fullWidth>
              <FormLabel>Practical Max Marks</FormLabel>
              <TextField 
                type="number"
                name="practicalMaxMarks"
                value={formData.practicalMaxMarks} 
                onChange={handleNumberChange('practicalMaxMarks')}
                inputProps={{ min: 0 }}
                fullWidth
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl required fullWidth>
              <FormLabel>Passing Percentage</FormLabel>
              <TextField 
                type="number"
                name="passingPercentage"
                value={formData.passingPercentage} 
                onChange={handleNumberChange('passingPercentage')}
                inputProps={{ min: 0, max: 100 }}
                fullWidth
              />
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox 
                  name="isActive" 
                  checked={formData.isActive} 
                  onChange={handleCheckboxChange}
                />
              }
              label="Active Configuration"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox 
                  name="requiresApproval" 
                  checked={formData.requiresApproval} 
                  onChange={handleCheckboxChange}
                />
              }
              label="Requires HOD/Principal Approval"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h6">Question Paper Structure</Typography>
        <QuestionPaperStructureForm
          initialData={formData.questionPaperStructure}
          onChange={handleQuestionPaperStructureChange}
          examId={initialData?.id}
          classId={formData.grade}
          subjectId={formData.subject}
        />

        <Button 
          sx={{ mt: 6 }}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          type="submit"
          size="large"
          fullWidth
        >
          {initialData?.id ? 'Update Configuration' : 'Create Configuration'}
        </Button>
      </Stack>
    </Box>
  );
};

export default ExamConfigurationForm;
