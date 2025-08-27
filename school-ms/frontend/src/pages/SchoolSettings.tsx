import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button } from '@mui/material';
import { settingsService, SchoolSettings } from '../services/settingsService';

const SchoolSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SchoolSettings>({ schoolName: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService.getSchoolSettings().then(setSettings).catch(() => {});
  }, []);

  const handleChange = (key: keyof SchoolSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await settingsService.updateSchoolSettings(settings);
      setSettings(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>School Settings</Typography>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="School Name" fullWidth value={settings.schoolName || ''} onChange={handleChange('schoolName')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Receipt Prefix" fullWidth value={settings.receiptPrefix || ''} onChange={handleChange('receiptPrefix')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Address Line 1" fullWidth value={settings.addressLine1 || ''} onChange={handleChange('addressLine1')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Address Line 2" fullWidth value={settings.addressLine2 || ''} onChange={handleChange('addressLine2')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="City" fullWidth value={settings.city || ''} onChange={handleChange('city')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="State" fullWidth value={settings.state || ''} onChange={handleChange('state')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Postal Code" fullWidth value={settings.postalCode || ''} onChange={handleChange('postalCode')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Country" fullWidth value={settings.country || ''} onChange={handleChange('country')} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Phone" fullWidth value={settings.phone || ''} onChange={handleChange('phone')} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Email" fullWidth value={settings.email || ''} onChange={handleChange('email')} />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SchoolSettingsPage;
