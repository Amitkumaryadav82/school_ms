import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  TextField,
  Stack,
  Typography,
  Divider,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from 'notistack';
import { QuestionPaperStructure, QuestionSection, QuestionType } from '../../services/examService';


interface QuestionPaperStructureFormProps {
  initialData?: QuestionPaperStructure;
  onChange: (structure: QuestionPaperStructure) => void;
  examId?: number;
  classId?: number;
  subjectId?: number | string;
}

const QuestionPaperStructureForm: React.FC<QuestionPaperStructureFormProps> = ({
  initialData,
  onChange,
  examId,
  classId,
  subjectId,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  
  // Save all rows to backend (batch save)
  const handleSave = async () => {
    if (!examId || !classId || !subjectId) {
      enqueueSnackbar('Please select and save exam configuration first.', { variant: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      // Prepare rows for backend (flatten sections to rows)
      const rows = structure.sections.map((section, idx) => ({
        // Backend expects: id (if editing), examId, classId, subjectId, questionNumber, unitName, marks
        id: section.id,
        examId,
        classId,
        subjectId,
        questionNumber: idx + 1,
        unitName: section.name,
        marks: section.marksPerQuestion * section.totalQuestions,
        // Optionally add more fields if backend expects
      }));
      const res = await axios.post('/api/question-paper-format/batch', rows, {
        params: { examId, classId, subjectId },
      });
      enqueueSnackbar('Question paper format saved successfully.', { variant: 'success' });
      // Optionally reload data or call onChange
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Could not save question paper format.', { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  const [units, setUnits] = useState<{ id: number; name: string }[]>([]);
  // Fetch units/chapters from Blueprint API when examId, classId, or subjectId changes
  useEffect(() => {
    if (examId && classId && subjectId) {
      axios
        .get('/api/blueprint', {
          params: {
            examId,
            classId,
            subjectId,
          },
        })
        .then((res) => {
          if (Array.isArray(res.data)) {
            setUnits(res.data.map((u: any) => ({ id: u.id, name: u.name })));
          } else {
            setUnits([]);
          }
        })
        .catch(() => setUnits([]));
    } else {
      setUnits([]);
    }
  }, [examId, classId, subjectId]);
  const [structure, setStructure] = useState<QuestionPaperStructure>({
    name: '',
    totalQuestions: 0,
    mandatoryQuestions: 0,
    optionalQuestions: 0,
    totalMarks: 0,
    sections: [],
  });

  const [currentSection, setCurrentSection] = useState<QuestionSection>({
    name: '',
    questionType: QuestionType.MULTIPLE_CHOICE,
    totalQuestions: 0,
    mandatoryQuestions: 0,
    marksPerQuestion: 0,
  });
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialData) {
      setStructure(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    // Update parent component when structure changes
    onChange(structure);
    
    // Calculate totals
    const totalQuestions = structure.sections.reduce(
      (sum, section) => sum + section.totalQuestions,
      0
    );
    const mandatoryQuestions = structure.sections.reduce(
      (sum, section) => sum + section.mandatoryQuestions,
      0
    );
    const totalMarks = structure.sections.reduce(
      (sum, section) => sum + section.totalQuestions * section.marksPerQuestion,
      0
    );

    setStructure(prev => ({
      ...prev,
      totalQuestions,
      mandatoryQuestions,
      optionalQuestions: totalQuestions - mandatoryQuestions,
      totalMarks,
    }));
  }, [structure.sections, onChange]);

  const handleStructureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStructure(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setCurrentSection(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (field: keyof QuestionSection) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setCurrentSection(prev => ({
      ...prev,
      [field]: isNaN(value) ? 0 : value,
    }));
  };

  const addSection = () => {
    if (
      !currentSection.name ||
      currentSection.totalQuestions <= 0 ||
      currentSection.mandatoryQuestions < 0 ||
      currentSection.marksPerQuestion <= 0
    ) {
      return;
    }

    if (editingIndex !== null) {
      // Update existing section
      const updatedSections = [...structure.sections];
      updatedSections[editingIndex] = currentSection;

      setStructure(prev => ({
        ...prev,
        sections: updatedSections,
      }));
      setEditingIndex(null);
    } else {
      // Add new section
      setStructure(prev => ({
        ...prev,
        sections: [...prev.sections, currentSection],
      }));
    }

    // Reset form
    setCurrentSection({
      name: '',
      questionType: QuestionType.MULTIPLE_CHOICE,
      totalQuestions: 0,
      mandatoryQuestions: 0,
      marksPerQuestion: 0,
    });
    handleClose();
  };

  const editSection = (index: number) => {
    setEditingIndex(index);
    setCurrentSection(structure.sections[index]);
    handleOpen();
  };

  const deleteSection = (index: number) => {
    setStructure(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  return (
    <Box border="1px solid #e0e0e0" borderRadius={2} p={4}>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Structure Name</FormLabel>
          <TextField
            name="name"
            value={structure.name}
            onChange={handleStructureChange}
            placeholder="e.g., Standard Math Paper Structure"
            fullWidth
          />
        </FormControl>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Section Name</TableCell>
              <TableCell>Question Type</TableCell>
              <TableCell align="right">Total Questions</TableCell>
              <TableCell align="right">Mandatory</TableCell>
              <TableCell align="right">Marks Each</TableCell>
              <TableCell align="right">Total Marks</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {structure.sections.map((section, index) => (
              <TableRow key={index}>
                <TableCell>{section.name}</TableCell>
                <TableCell>{section.questionType.replace(/_/g, ' ')}</TableCell>
                <TableCell align="right">{section.totalQuestions}</TableCell>
                <TableCell align="right">{section.mandatoryQuestions}</TableCell>
                <TableCell align="right">{section.marksPerQuestion}</TableCell>
                <TableCell align="right">{section.totalQuestions * section.marksPerQuestion}</TableCell>
                <TableCell>
                  <IconButton
                    aria-label="Edit section"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => editSection(index)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="Delete section"
                    size="small"
                    color="error"
                    onClick={() => deleteSection(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button 
          startIcon={<AddIcon />} 
          variant="contained" 
          color="primary" 
          onClick={handleOpen}
        >
          Add Question Section
        </Button>

        <Divider />

        <Box>
          <Typography variant="h6" mb={2}>
            Paper Summary
          </Typography>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={4}>
            <Box>
              <FormLabel>Total Questions</FormLabel>
              <TextField
                type="number"
                value={structure.totalQuestions}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Box>
            <Box>
              <FormLabel>Mandatory Questions</FormLabel>
              <TextField
                type="number"
                value={structure.mandatoryQuestions}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Box>
            <Box>
              <FormLabel>Total Marks</FormLabel>
              <TextField
                type="number"
                value={structure.totalMarks}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Box>
          </Box>
        </Box>
      </Stack>

      {/* Save Button */}
      <Box mt={6} textAlign="right">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSave} 
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={20} /> : undefined}
        >
          Save
        </Button>
      </Box>

      {/* Question Section Modal */}
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Edit Question Section' : 'Add Question Section'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>

            <FormControl required>
              <FormLabel>Unit Name</FormLabel>
              <Select
                name="name"
                value={currentSection.name}
                onChange={handleSectionChange}
                disabled={!examId || units.length === 0}
                displayEmpty
                fullWidth
              >
                <MenuItem value="" disabled>
                  {!examId
                    ? 'Save exam configuration to select units'
                    : units.length === 0
                      ? 'No units available'
                      : 'Select unit'}
                </MenuItem>
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.name}>
                    {unit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl required>
              <FormLabel>Question Type</FormLabel>
              <Select
                name="questionType"
                value={currentSection.questionType}
                onChange={handleSectionChange}
                fullWidth
              >
                {Object.values(QuestionType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Instructions (Optional)</FormLabel>
              <TextField
                name="instructions"
                placeholder="e.g., Answer any 5 questions from this section"
                value={currentSection.instructions || ''}
                onChange={handleSectionChange}
                fullWidth
              />
            </FormControl>

            <FormControl required>
              <FormLabel>Number of Questions</FormLabel>
              <TextField
                type="number"
                value={currentSection.totalQuestions}
                onChange={handleNumberChange('totalQuestions')}
                inputProps={{ min: 1 }}
                fullWidth
              />
            </FormControl>

            <FormControl required>
              <FormLabel>Mandatory Questions</FormLabel>
              <TextField
                type="number"
                value={currentSection.mandatoryQuestions}
                onChange={handleNumberChange('mandatoryQuestions')}
                inputProps={{ min: 0, max: currentSection.totalQuestions }}
                fullWidth
              />
            </FormControl>

            <FormControl required>
              <FormLabel>Marks per Question</FormLabel>
              <TextField
                type="number"
                value={currentSection.marksPerQuestion}
                onChange={handleNumberChange('marksPerQuestion')}
                inputProps={{ min: 0.5, step: 0.5 }}
                fullWidth
              />
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={addSection}>
            {editingIndex !== null ? 'Update' : 'Add'} Section
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionPaperStructureForm;
