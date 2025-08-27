import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Grid, Snackbar, Alert } from '@mui/material';
import schoolProfile, { SchoolProfile } from '../config/schoolProfile';

const getInitialProfile = (): SchoolProfile => ({
  name: schoolProfile.name,
  addressLine1: schoolProfile.addressLine1,
  addressLine2: schoolProfile.addressLine2,
  phone: schoolProfile.phone,
  email: schoolProfile.email,
  logoUrl: schoolProfile.logoUrl,
});

const AdminSchoolSettings: React.FC = () => {
  const [profile, setProfile] = useState<SchoolProfile>(getInitialProfile());
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleChange = (field: keyof SchoolProfile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handleSave = () => {
    // For now, save to localStorage (simulate backend persistence)
    localStorage.setItem('schoolProfile', JSON.stringify(profile));
    setSnackbar({ open: true, message: 'School profile saved! (reload to apply)', severity: 'success' });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>School Profile Settings</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label="School Name" fullWidth value={profile.name} onChange={handleChange('name')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Address Line 1" fullWidth value={profile.addressLine1 || ''} onChange={handleChange('addressLine1')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Address Line 2" fullWidth value={profile.addressLine2 || ''} onChange={handleChange('addressLine2')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Phone" fullWidth value={profile.phone || ''} onChange={handleChange('phone')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Email" fullWidth value={profile.email || ''} onChange={handleChange('email')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Logo URL" fullWidth value={profile.logoUrl || ''} onChange={handleChange('logoUrl')} />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
        </Box>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSchoolSettings;
