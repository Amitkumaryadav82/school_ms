import React from 'react';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import TimetableSettingsPage from './timetable/TimetableSettingsPage';
import ClassTimetablePage from './timetable/ClassTimetablePage';

const TimetableLanding: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Settings" />
          <Tab label="Class Timetable" />
        </Tabs>
      </Paper>
      {tab === 0 && <TimetableSettingsPage />}
      {tab === 1 && <ClassTimetablePage />}
    </Box>
  );
};

export default TimetableLanding;
