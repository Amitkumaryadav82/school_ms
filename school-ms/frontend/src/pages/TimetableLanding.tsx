import React from 'react';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import TimetableSettingsPage from './timetable/TimetableSettingsPage';
import TimetableRequirementsPage from './timetable/TimetableRequirementsPage';
import ClassTimetablePage from './timetable/ClassTimetablePage';
import TeacherSubstitutionsPage from './timetable/TeacherSubstitutionsPage';

const TimetableLanding: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Settings" />
          <Tab label="Requirements" />
          <Tab label="Class Timetable" />
          <Tab label="Substitutions" />
        </Tabs>
      </Paper>
      {tab === 0 && <TimetableSettingsPage />}
      {tab === 1 && <TimetableRequirementsPage />}
      {tab === 2 && <ClassTimetablePage />}
      {tab === 3 && <TeacherSubstitutionsPage />}
    </Box>
  );
};

export default TimetableLanding;
