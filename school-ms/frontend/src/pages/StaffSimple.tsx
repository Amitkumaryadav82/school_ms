import {
    Add as AddIcon,
    CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/permissions';

const Staff: React.FC = () => {
  const { user } = useAuth();
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Staff Management</Typography>
        {hasPermission(user?.role || '', 'MANAGE_STAFF') && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CloudUploadIcon />}
              onClick={() => setBulkUploadDialogOpen(true)}
            >
              Bulk Upload
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Add Staff Member
            </Button>
          </Stack>
        )}
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6">Staff Overview</Typography>
      </Paper>
    </Box>
  );
};

export default Staff;
