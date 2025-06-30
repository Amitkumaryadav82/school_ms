import * as React from 'react';
import { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import {
    AssessmentOutlined,
    GetApp,
    PeopleOutline,
    Person,
    Print
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

interface AttendanceReportsSkeletonProps {
  isAdmin: boolean;
  staffType?: string;
}

const AttendanceReportsSkeleton: React.FC<AttendanceReportsSkeletonProps> = ({ isAdmin, staffType = 'ALL' }) => {
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Attendance Reports & Analytics
        </Typography>
        
        {isAdmin && (
          <Box>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              sx={{ mr: 1 }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
            >
              Print
            </Button>
          </Box>
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="attendance reports tabs"
        >
          <Tab icon={<Person />} label="Individual Reports" />
          {isAdmin && <Tab icon={<PeopleOutline />} label="Department Reports" />}
          {isAdmin && <Tab icon={<AssessmentOutlined />} label="Trend Analysis" />}
        </Tabs>

        {/* Individual Teacher Report */}
        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Individual Attendance Reports
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                The Individual Reports tab allows you to view attendance details for specific teachers.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Note: Backend connectivity is currently being set up. This is a placeholder view.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Department Reports */}
        {isAdmin && (
          <TabPanel value={tabValue} index={1}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department Attendance Reports
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography>
                  The Department Reports tab provides attendance statistics by department.
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="overline">Teaching Staff</Typography>
                      <Typography variant="h4">92%</Typography>
                      <Chip label="Excellent" color="success" size="small" sx={{ mt: 1 }} />
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="overline">Non-Teaching Staff</Typography>
                      <Typography variant="h4">89%</Typography>
                      <Chip label="Good" color="primary" size="small" sx={{ mt: 1 }} />
                    </Paper>
                  </Grid>
                </Grid>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Note: This displays sample data. Real data will be shown when connected to the backend.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>
        )}

        {/* Trend Analysis */}
        {isAdmin && (
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Attendance Trend Analysis
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography>
                  The Trend Analysis tab shows attendance patterns over time.
                </Typography>
                <Box sx={{ 
                  height: 200, 
                  background: 'linear-gradient(45deg, rgba(240,240,240,1) 0%, rgba(245,245,245,1) 100%)', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 3
                }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Note: This is a placeholder. Real charts will be displayed when connected to the backend.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
};

export default AttendanceReportsSkeleton;
