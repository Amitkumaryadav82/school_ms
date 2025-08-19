import React from 'react';
import { Alert, Box, Button, Grid, Paper, Snackbar, TextField, Typography } from '@mui/material';
import WorkingDaysPicker from '../../components/timetable/WorkingDaysPicker';
import timetableService, { TimetableSettings } from '../../services/timetableService';

const TimetableSettingsPage: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [settings, setSettings] = React.useState<TimetableSettings | null>(null);
  const [errors, setErrors] = React.useState<string>('');
  const [success, setSuccess] = React.useState<string>('');

  React.useEffect(() => {
    (async () => {
      try {
        const s = await timetableService.getSettings();
        setSettings(s);
      } catch (e: any) {
        setErrors(e.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    if (!settings) return;
    setErrors('');
    setSuccess('');
    try {
      const payload = {
        workingDaysMask: settings.working_days_mask,
        periodsPerDay: Math.max(1, settings.periods_per_day),
        periodDurationMin: Math.max(20, settings.period_duration_min),
        lunchAfterPeriod: Math.max(1, settings.lunch_after_period),
  maxPeriodsPerTeacherPerDay: Math.max(1, settings.max_periods_per_teacher_per_day || settings.maxPeriodsPerTeacherPerDay || 5),
        startTime: settings.startTime || '08:30:00',
        endTime: settings.endTime || '15:30:00',
      };
      const saved = await timetableService.saveSettings(payload);
      setSettings(saved);
      setSuccess('Settings saved successfully');
    } catch (e: any) {
      setErrors(e.message || 'Save failed');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (errors) return <Typography color="error">{errors}</Typography>;
  if (!settings) return null;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Global Timetable Settings</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Working days</Typography>
          <WorkingDaysPicker
            mask={settings.working_days_mask}
            onChange={(m) => setSettings({ ...settings, working_days_mask: m })}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            type="number"
            label="Periods per day"
            fullWidth
            value={settings.periods_per_day}
            onChange={(e) => setSettings({ ...settings, periods_per_day: parseInt(e.target.value || '0', 10) })}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            type="number"
            label="Period duration (min)"
            fullWidth
            value={settings.period_duration_min}
            onChange={(e) => setSettings({ ...settings, period_duration_min: parseInt(e.target.value || '0', 10) })}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            type="number"
            label="Lunch after period"
            fullWidth
            value={settings.lunch_after_period}
            onChange={(e) => setSettings({ ...settings, lunch_after_period: parseInt(e.target.value || '0', 10) })}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            type="number"
            label="Max periods per teacher per day"
            fullWidth
            value={settings.max_periods_per_teacher_per_day ?? settings.maxPeriodsPerTeacherPerDay ?? 5}
            onChange={(e) => setSettings({ ...settings, max_periods_per_teacher_per_day: parseInt(e.target.value || '0', 10) })}
            helperText="Used by the generator to cap a teacher's daily load"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            type="time"
            label="School start time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={(settings.startTime || '08:30:00').slice(0,5)}
            onChange={(e) => setSettings({ ...settings, startTime: `${e.target.value}:00` })}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            type="time"
            label="School end time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={(settings.endTime || '15:30:00').slice(0,5)}
            onChange={(e) => setSettings({ ...settings, endTime: `${e.target.value}:00` })}
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={onSave}>Save</Button>
      </Box>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }} onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
      <Snackbar open={!!errors} autoHideDuration={5000} onClose={() => setErrors('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" sx={{ width: '100%' }} onClose={() => setErrors('')}>
          {errors || 'Something went wrong'}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TimetableSettingsPage;
