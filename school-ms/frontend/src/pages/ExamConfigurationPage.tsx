import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { 
  SubjectMasterList, 
  ClassConfigurationList 
} from '../components/exam/configuration';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`exam-config-tabpanel-${index}`}
      aria-labelledby={`exam-config-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `exam-config-tab-${index}`,
    'aria-controls': `exam-config-tabpanel-${index}`,
  };
}

const ExamConfigurationPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/exams');
            }}
          >
            Examinations
          </MuiLink>
          <Typography color="text.primary">Configuration Management</Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Typography variant="h4" component="h1" gutterBottom>
          Exam Configuration Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage subjects, class configurations, and exam setups for your institution.
        </Typography>

        {/* Main Content */}
        <Paper sx={{ mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="exam configuration tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Subject Master" {...a11yProps(0)} />
              <Tab label="Class Configurations" {...a11yProps(1)} />
              <Tab label="Subject Assignments" {...a11yProps(2)} />
              <Tab label="Reports & Analytics" {...a11yProps(3)} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box px={3}>
              <Typography variant="h6" gutterBottom>
                Subject Master Management
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Create and manage subjects that can be used across different classes and exam configurations.
              </Typography>
              <SubjectMasterList />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box px={3}>
              <Typography variant="h6" gutterBottom>
                Class Configuration Management
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Set up exam configurations for specific classes, sections, and academic years.
              </Typography>
              <ClassConfigurationList />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box px={3}>
              <Typography variant="h6" gutterBottom>
                Subject Assignments
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Assign subjects to class configurations and set theory/practical marks distribution.
              </Typography>
              <Box py={4} textAlign="center">
                <Typography variant="h6" color="text.secondary">
                  Subject Assignment Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Coming soon - Select a class configuration from the previous tab to manage its subjects.
                </Typography>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box px={3}>
              <Typography variant="h6" gutterBottom>
                Reports & Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                View reports and analytics for exam configurations and subject usage.
              </Typography>
              <Box py={4} textAlign="center">
                <Typography variant="h6" color="text.secondary">
                  Configuration Reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Coming soon - Comprehensive reports on exam configurations and usage analytics.
                </Typography>
              </Box>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default ExamConfigurationPage;
