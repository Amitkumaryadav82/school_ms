import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import api from '../services/api';

interface ChapterDistribution {
  chapterName: string;
  sectionDistributions: SectionDistribution[];
  totalMarks: number;
  weightagePercentage: number;
}

interface SectionDistribution {
  sectionName: string;
  questionType: string;
  questionCount: number;
  marksPerQuestion: number;
  totalMarks: number;
}

interface ExamConfiguration {
  id: number;
  name: string;
  subject: string;
  grade: number;
  theoryMaxMarks: number;
  practicalMaxMarks: number;
  questionPaperStructure: {
    id: number;
    name: string;
    totalMarks: number;
    sections: {
      id: number;
      sectionName: string;
      questionType: string;
      marksPerQuestion: number;
      questionCount: number;
      isMandatory: boolean;
    }[];
  };
}

interface Blueprint {
  name: string;
  description: string;
  examId: number;
  examConfigurationId: number;
  chapterDistributions: ChapterDistribution[];
}

interface BlueprintFormProps {
  mode: 'create' | 'edit';
}

const BlueprintForm: React.FC<BlueprintFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [examConfigurations, setExamConfigurations] = useState<ExamConfiguration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<ExamConfiguration | null>(null);
  
  const [chapters, setChapters] = useState<string[]>([]);
  const [newChapter, setNewChapter] = useState<string>('');
  const [openChapterDialog, setOpenChapterDialog] = useState(false);
  
  const [blueprint, setBlueprint] = useState<Blueprint>({
    name: '',
    description: '',
    examId: 0,
    examConfigurationId: 0,
    chapterDistributions: []
  });
  
  // Load exam configurations and blueprint data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch exam configurations
        const configResponse = await api.get('/api/exams/configurations');
        setExamConfigurations(configResponse.data);
        
        // If in edit mode, fetch the blueprint data
        if (mode === 'edit' && id) {
          const blueprintResponse = await api.get(`/api/exams/blueprints/${id}`);
          setBlueprint(blueprintResponse.data);
          
          // Find the matching configuration
          const config = configResponse.data.find(
            (c: ExamConfiguration) => c.id === blueprintResponse.data.examConfigurationId
          );
          
          setSelectedConfig(config || null);
          
          // Extract unique chapter names
          const uniqueChapters = new Set<string>();
          blueprintResponse.data.chapterDistributions.forEach((dist: ChapterDistribution) => {
            uniqueChapters.add(dist.chapterName);
          });
          setChapters(Array.from(uniqueChapters));
        }
        
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, mode]);
  
  const handleConfigChange = (event: SelectChangeEvent<number>) => {
    const configId = event.target.value as number;
    const config = examConfigurations.find(c => c.id === configId) || null;
    setSelectedConfig(config);
    
    if (config) {
      setBlueprint({
        ...blueprint,
        examId: config.id, // This might need adjustment based on your actual data structure
        examConfigurationId: config.id,
        chapterDistributions: []
      });
    }
  };
  
  const handleChapterDialogOpen = () => {
    setOpenChapterDialog(true);
  };
  
  const handleChapterDialogClose = () => {
    setOpenChapterDialog(false);
    setNewChapter('');
  };
  
  const handleAddChapter = () => {
    if (newChapter.trim() && !chapters.includes(newChapter)) {
      const updatedChapters = [...chapters, newChapter];
      setChapters(updatedChapters);
      
      // Create initial distribution for the new chapter
      if (selectedConfig && selectedConfig.questionPaperStructure) {
        const newDistributions: ChapterDistribution[] = [...blueprint.chapterDistributions];
        
        // Create a distribution entry for each question section type
        const sectionDistributions = selectedConfig.questionPaperStructure.sections.map(section => ({
          sectionName: section.sectionName,
          questionType: section.questionType,
          questionCount: 0,
          marksPerQuestion: section.marksPerQuestion,
          totalMarks: 0
        }));
        
        newDistributions.push({
          chapterName: newChapter,
          sectionDistributions: sectionDistributions,
          totalMarks: 0,
          weightagePercentage: 0
        });
        
        setBlueprint({
          ...blueprint,
          chapterDistributions: newDistributions
        });
      }
      
      handleChapterDialogClose();
    }
  };
  
  const handleRemoveChapter = (chapterName: string) => {
    const updatedChapters = chapters.filter(chapter => chapter !== chapterName);
    setChapters(updatedChapters);
    
    const updatedDistributions = blueprint.chapterDistributions.filter(
      dist => dist.chapterName !== chapterName
    );
    
    setBlueprint({
      ...blueprint,
      chapterDistributions: updatedDistributions
    });
  };
  
  const handleQuestionCountChange = (
    chapterName: string,
    questionType: string,
    value: number
  ) => {
    if (!selectedConfig) return;
    
    const updatedDistributions = [...blueprint.chapterDistributions];
    const chapterIndex = updatedDistributions.findIndex(dist => dist.chapterName === chapterName);
    
    if (chapterIndex >= 0) {
      const sectionIndex = updatedDistributions[chapterIndex].sectionDistributions.findIndex(
        section => section.questionType === questionType
      );
      
      if (sectionIndex >= 0) {
        // Update question count and recalculate total marks
        const section = updatedDistributions[chapterIndex].sectionDistributions[sectionIndex];
        section.questionCount = value;
        section.totalMarks = section.marksPerQuestion * value;
        
        // Recalculate chapter total marks
        updatedDistributions[chapterIndex].totalMarks = updatedDistributions[chapterIndex].sectionDistributions.reduce(
          (sum, section) => sum + section.totalMarks, 0
        );
        
        // Recalculate all weightage percentages
        const totalPaperMarks = selectedConfig.questionPaperStructure.totalMarks;
        
        updatedDistributions.forEach(dist => {
          dist.weightagePercentage = (dist.totalMarks / totalPaperMarks) * 100;
        });
        
        setBlueprint({
          ...blueprint,
          chapterDistributions: updatedDistributions
        });
      }
    }
  };
  
  const handleSaveBlueprint = async () => {
    try {
      setLoading(true);
      
      if (mode === 'create') {
        await api.post('/api/exams/blueprints', blueprint);
      } else {
        await api.put(`/api/exams/blueprints/${id}`, blueprint);
      }
      
      setSuccess(`Blueprint ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      setTimeout(() => {
        navigate('/exams/blueprints');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || `Failed to ${mode} blueprint`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <Layout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/exams')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            {mode === 'create' ? 'Create New Blueprint' : 'Edit Blueprint'}
          </Typography>
        </Box>
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Blueprint Name"
                fullWidth
                value={blueprint.name}
                onChange={(e) => setBlueprint({ ...blueprint, name: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="exam-config-label">Exam Configuration</InputLabel>
                <Select
                  labelId="exam-config-label"
                  value={selectedConfig?.id || ''}
                  label="Exam Configuration"
                  onChange={handleConfigChange}
                  disabled={mode === 'edit'}
                >
                  {examConfigurations.map((config) => (
                    <MenuItem key={config.id} value={config.id}>
                      {config.name} - {config.subject} (Class {config.grade})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={blueprint.description}
                onChange={(e) => setBlueprint({ ...blueprint, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Chapter-wise Distribution</Typography>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleChapterDialogOpen}
              disabled={!selectedConfig}
            >
              Add Chapter
            </Button>
          </Box>
          
          {selectedConfig && chapters.length > 0 ? (
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="blueprint distribution table">
                <TableHead>
                  <TableRow>
                    <TableCell>Chapter</TableCell>
                    {selectedConfig.questionPaperStructure.sections.map((section) => (
                      <TableCell key={section.id} align="center">
                        {section.sectionName}<br />
                        <Typography variant="caption">
                          ({section.marksPerQuestion} marks each)
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell align="center">Total Marks</TableCell>
                    <TableCell align="center">Weightage %</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chapters.map((chapterName) => {
                    const chapterDist = blueprint.chapterDistributions.find(
                      dist => dist.chapterName === chapterName
                    );
                    
                    return (
                      <TableRow key={chapterName}>
                        <TableCell component="th" scope="row">
                          {chapterName}
                        </TableCell>
                        
                        {selectedConfig.questionPaperStructure.sections.map((section) => {
                          const sectionDist = chapterDist?.sectionDistributions.find(
                            sd => sd.questionType === section.questionType
                          );
                          
                          return (
                            <TableCell key={section.id} align="center">
                              <TextField
                                type="number"
                                inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                value={sectionDist?.questionCount || 0}
                                onChange={(e) => handleQuestionCountChange(
                                  chapterName,
                                  section.questionType,
                                  Number(e.target.value)
                                )}
                                variant="outlined"
                                size="small"
                                sx={{ width: '80px' }}
                              />
                            </TableCell>
                          );
                        })}
                        
                        <TableCell align="center">
                          {chapterDist?.totalMarks.toFixed(1) || 0}
                        </TableCell>
                        
                        <TableCell align="center">
                          {chapterDist?.weightagePercentage.toFixed(1) || 0}%
                        </TableCell>
                        
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveChapter(chapterName)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  <TableRow sx={{ '& td, & th': { fontWeight: 'bold', borderTop: '2px solid rgba(224, 224, 224, 1)' } }}>
                    <TableCell>Total</TableCell>
                    
                    {selectedConfig.questionPaperStructure.sections.map((section) => {
                      const totalQuestionsForType = blueprint.chapterDistributions.reduce(
                        (sum, dist) => {
                          const sectionDist = dist.sectionDistributions.find(
                            sd => sd.questionType === section.questionType
                          );
                          return sum + (sectionDist?.questionCount || 0);
                        },
                        0
                      );
                      
                      return (
                        <TableCell key={section.id} align="center">
                          {totalQuestionsForType}
                        </TableCell>
                      );
                    })}
                    
                    <TableCell align="center">
                      {blueprint.chapterDistributions.reduce(
                        (sum, dist) => sum + dist.totalMarks,
                        0
                      ).toFixed(1)}
                    </TableCell>
                    
                    <TableCell align="center">
                      {blueprint.chapterDistributions.reduce(
                        (sum, dist) => sum + dist.weightagePercentage,
                        0
                      ).toFixed(1)}%
                    </TableCell>
                    
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
              {!selectedConfig
                ? 'Please select an exam configuration first'
                : 'No chapters added yet. Click "Add Chapter" to begin.'}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveBlueprint}
              disabled={!blueprint.name || chapters.length === 0}
              sx={{ mr: 2 }}
            >
              Save Blueprint
            </Button>
          </Box>
        </Paper>
      </Box>
      
      {/* Add Chapter Dialog */}
      <Dialog open={openChapterDialog} onClose={handleChapterDialogClose}>
        <DialogTitle>Add Chapter</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the chapter name to add to the blueprint.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Chapter Name"
            fullWidth
            variant="outlined"
            value={newChapter}
            onChange={(e) => setNewChapter(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChapterDialogClose}>Cancel</Button>
          <Button onClick={handleAddChapter} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default BlueprintForm;
