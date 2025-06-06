import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`exam-tabpanel-${index}`}
      aria-labelledby={`exam-tab-${index}`}
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

function a11yProps(index: number) {
  return {
    id: `exam-tab-${index}`,
    'aria-controls': `exam-tabpanel-${index}`,
  };
}

const ExaminationManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grades, setGrades] = useState<number[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Load grades (classes) for selection
    setGrades([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    
    // Load exam types
    const fetchExamTypes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/exams/types');
        setExamTypes(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load exam types');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamTypes();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGradeChange = (event: SelectChangeEvent<number>) => {
    setSelectedGrade(event.target.value as number);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Examination Management
        </Typography>

        <Paper sx={{ width: '100%', mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              aria-label="examination management tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Exam Configuration" {...a11yProps(0)} />
              <Tab label="Question Structure" {...a11yProps(1)} />
              <Tab label="Blueprint" {...a11yProps(2)} />
              <Tab label="Question Papers" {...a11yProps(3)} />
              <Tab label="Marks Entry" {...a11yProps(4)} />
              <Tab label="Reports" {...a11yProps(5)} />
            </Tabs>
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="grade-select-label">Class/Grade</InputLabel>
              <Select
                labelId="grade-select-label"
                id="grade-select"
                value={selectedGrade}
                label="Class/Grade"
                onChange={handleGradeChange}
              >
                <MenuItem value={0}>All Classes</MenuItem>
                {grades.map((grade) => (
                  <MenuItem key={grade} value={grade}>Class {grade}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Exam Configuration Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" sx={{ mb: 2 }}>Subject-wise Exam Configuration</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => navigate('/exams/configuration/new')}
                  sx={{ mb: 2 }}
                >
                  Create New Configuration
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                {/* Configuration listing will go here */}
                <Typography color="textSecondary">
                  Select a class to view existing configurations or create a new one.
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Question Structure Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ mb: 2 }}>Question Paper Structure</Typography>
            <Typography paragraph>
              Define the structure of question papers, including mark distributions and question types.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/exams/structure/new')}
            >
              Create New Structure
            </Button>
          </TabPanel>

          {/* Blueprint Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>Exam Blueprint Management</Typography>
            <Typography paragraph>
              Create and manage chapter-wise distribution of marks for different question types.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/exams/blueprint/new')}
            >
              Create New Blueprint
            </Button>
          </TabPanel>
          
          {/* Question Papers Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>Question Paper Management</Typography>
            <Typography paragraph>
              Create, review, and approve question papers. Compare against blueprints for validation.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/exams/papers/new')}
            >
              Create New Question Paper
            </Button>
          </TabPanel>
          
          {/* Marks Entry Tab */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>Exam Marks Entry</Typography>
            <Typography paragraph>
              Enter and manage student marks for different exams and subjects.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/exams/marks/entry')}
            >
              Enter Marks
            </Button>
          </TabPanel>
          
          {/* Reports Tab */}
          <TabPanel value={tabValue} index={5}>
            <Typography variant="h6" sx={{ mb: 2 }}>Examination Reports</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Button 
                  fullWidth
                  variant="outlined" 
                  onClick={() => navigate('/exams/reports/tabulation')}
                >
                  Tabulation Sheets
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button 
                  fullWidth
                  variant="outlined" 
                  onClick={() => navigate('/exams/reports/performance')}
                >
                  Performance Analysis
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button 
                  fullWidth
                  variant="outlined" 
                  onClick={() => navigate('/exams/reports/report-cards')}
                >
                  Generate Report Cards
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Box>
    </Layout>
  );
};

export default ExaminationManagement;
