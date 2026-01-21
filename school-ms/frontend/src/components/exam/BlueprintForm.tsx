import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  TextField,
  Stack,
  Typography,
  Select,
  MenuItem,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from 'notistack';
import { ExamBlueprint, ChapterDistribution, QuestionType, ApprovalStatus } from '../../services/examService';
import { examService } from '../../services/examService';

interface BlueprintFormProps {
  examConfigurationId: number;
  initialData?: ExamBlueprint;
  onSubmitSuccess?: (blueprint: ExamBlueprint) => void;
}

const BlueprintForm: React.FC<BlueprintFormProps> = ({ examConfigurationId, initialData, onSubmitSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExamBlueprint>({
    name: '',
    examConfigurationId,
    totalMarks: 0,
    description: '',
    createdBy: 0,
    approvalStatus: ApprovalStatus.PENDING,
    chapterDistributions: [],
  });
  const [currentChapter, setCurrentChapter] = useState<ChapterDistribution>({
    chapterName: '',
    weightPercentage: 0,
    totalMarks: 0,
    questionTypeDistribution: [],
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setFormData(prev => ({ ...prev, [name]: isNaN(value) ? 0 : value }));
  };

  // Chapter Distribution Handlers
  const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentChapter(prev => ({ ...prev, [name]: value }));
  };
  
  const handleChapterNumberChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setCurrentChapter(prev => ({ ...prev, [name]: isNaN(value) ? 0 : value }));
  };
  
  const handleQuestionTypeDistributionChange = (index: number, field: string, value: any) => {
    setCurrentChapter(prev => {
      const updated = [...prev.questionTypeDistribution];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, questionTypeDistribution: updated };
    });
  };
  
  const addQuestionTypeDistribution = () => {
    setCurrentChapter(prev => ({
      ...prev,
      questionTypeDistribution: [
        ...prev.questionTypeDistribution,
        { questionType: QuestionType.MULTIPLE_CHOICE, marks: 0 },
      ],
    }));
  };
  
  const removeQuestionTypeDistribution = (index: number) => {
    setCurrentChapter(prev => ({
      ...prev,
      questionTypeDistribution: prev.questionTypeDistribution.filter((_, i) => i !== index),
    }));
  };
  
  const addChapter = () => {
    if (!currentChapter.chapterName || currentChapter.weightPercentage <= 0) return;
    if (editingIndex !== null) {
      const updated = [...formData.chapterDistributions];
      updated[editingIndex] = currentChapter;
      setFormData(prev => ({ ...prev, chapterDistributions: updated }));
      setEditingIndex(null);
    } else {
      setFormData(prev => ({ ...prev, chapterDistributions: [...prev.chapterDistributions, currentChapter] }));
    }
    setCurrentChapter({ chapterName: '', weightPercentage: 0, totalMarks: 0, questionTypeDistribution: [] });
  };
  
  const editChapter = (index: number) => {
    setEditingIndex(index);
    setCurrentChapter(formData.chapterDistributions[index]);
  };
  
  const deleteChapter = (index: number) => {
    setFormData(prev => ({ ...prev, chapterDistributions: prev.chapterDistributions.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let response;
      if (initialData?.id) {
        response = await examService.updateBlueprint(initialData.id, formData);
        enqueueSnackbar('Blueprint updated successfully', { variant: 'success' });
      } else {
        response = await examService.createBlueprint(formData);
        enqueueSnackbar('Blueprint created successfully', { variant: 'success' });
      }
      if (onSubmitSuccess && response) onSubmitSuccess(response as any);
    } catch (error) {
      enqueueSnackbar('Failed to save blueprint', { variant: 'error' });
      console.error('Error saving blueprint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} p={4} border="1px solid #e0e0e0" borderRadius={2} boxShadow={2}>
      <Typography variant="h5" mb={4}>{initialData?.id ? 'Edit Blueprint' : 'Create New Blueprint'}</Typography>
      <Stack spacing={4}>
        <FormControl required>
          <FormLabel>Blueprint Name</FormLabel>
          <TextField name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Term 1 Blueprint" fullWidth />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <TextField name="description" value={formData.description} onChange={handleChange} placeholder="Optional description" fullWidth />
        </FormControl>
        <FormControl required>
          <FormLabel>Total Marks</FormLabel>
          <TextField 
            type="number"
            name="totalMarks"
            value={formData.totalMarks} 
            onChange={handleNumberChange('totalMarks')}
            inputProps={{ min: 0 }}
            fullWidth
          />
        </FormControl>
        <Divider />
        <Typography variant="h6">Chapter Distribution</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Chapter</TableCell>
              <TableCell align="right">Weight %</TableCell>
              <TableCell align="right">Total Marks</TableCell>
              <TableCell>Question Type Distribution</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.chapterDistributions.map((chapter, idx) => (
              <TableRow key={idx}>
                <TableCell>{chapter.chapterName}</TableCell>
                <TableCell align="right">{chapter.weightPercentage}</TableCell>
                <TableCell align="right">{chapter.totalMarks}</TableCell>
                <TableCell>
                  {chapter.questionTypeDistribution.map((qtd, i) => (
                    <span key={i}>{qtd.questionType.replace(/_/g, ' ')}: {qtd.marks} </span>
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton aria-label="Edit chapter" size="small" sx={{ mr: 1 }} onClick={() => editChapter(idx)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="Delete chapter" size="small" color="error" onClick={() => deleteChapter(idx)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box border="1px solid #e0e0e0" borderRadius={1} p={3} mt={2}>
          <Typography variant="subtitle2" mb={2}>{editingIndex !== null ? 'Edit Chapter' : 'Add Chapter'}</Typography>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={3}>
              <FormControl required fullWidth>
                <FormLabel>Chapter Name</FormLabel>
                <TextField name="chapterName" value={currentChapter.chapterName} onChange={handleChapterChange} placeholder="e.g., Algebra" fullWidth />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl required fullWidth>
                <FormLabel>Weight %</FormLabel>
                <TextField 
                  type="number"
                  name="weightPercentage"
                  value={currentChapter.weightPercentage} 
                  onChange={handleChapterNumberChange('weightPercentage')}
                  inputProps={{ min: 0, max: 100 }}
                  fullWidth
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl required fullWidth>
                <FormLabel>Total Marks</FormLabel>
                <TextField 
                  type="number"
                  name="totalMarks"
                  value={currentChapter.totalMarks} 
                  onChange={handleChapterNumberChange('totalMarks')}
                  inputProps={{ min: 0 }}
                  fullWidth
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button onClick={addChapter} variant="contained" color="primary" fullWidth>
                {editingIndex !== null ? 'Update' : 'Add'} Chapter
              </Button>
            </Grid>
          </Grid>
          <Box mt={2}>
            <Typography variant="subtitle2">Question Type Distribution</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addQuestionTypeDistribution} sx={{ mt: 1, mb: 2 }}>
              Add Type
            </Button>
            <Stack spacing={1}>
              {currentChapter.questionTypeDistribution.map((qtd, i) => (
                <Grid container spacing={1} key={i} alignItems="center">
                  <Grid item xs={6}>
                    <Select 
                      value={qtd.questionType} 
                      onChange={(e) => handleQuestionTypeDistributionChange(i, 'questionType', e.target.value)} 
                      size="small"
                      fullWidth
                    >
                      {Object.values(QuestionType).map(type => (
                        <MenuItem key={type} value={type}>{type.replace(/_/g, ' ')}</MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField 
                      type="number"
                      value={qtd.marks} 
                      onChange={(e) => handleQuestionTypeDistributionChange(i, 'marks', parseFloat(e.target.value) || 0)} 
                      size="small"
                      inputProps={{ min: 0 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton aria-label="Remove" size="small" color="error" onClick={() => removeQuestionTypeDistribution(i)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </Box>
        </Box>
        <Button 
          sx={{ mt: 6 }}
          variant="contained" 
          color="primary" 
          disabled={isSubmitting} 
          type="submit" 
          size="large"
          fullWidth
        >
          {initialData?.id ? 'Update Blueprint' : 'Create Blueprint'}
        </Button>
      </Stack>
    </Box>
  );
};

export default BlueprintForm;
