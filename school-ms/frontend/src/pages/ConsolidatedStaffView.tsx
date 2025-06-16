import {
    Add as AddIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import BaseTable from '../components/common/BaseTable';
import BulkStaffUploadDialog from '../components/dialogs/BulkStaffUploadDialog'; // Reuse existing dialog
import StaffDialog from '../components/dialogs/StaffDialog'; // Reuse existing dialog
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import { useNotification } from '../context/NotificationContext';
import { useSimplifiedApi, useSimplifiedApiMutation } from '../hooks/useSimplifiedApi';
import { consolidatedStaffService } from '../services/consolidatedStaffService';
import { EmploymentStatus, StaffMember } from '../services/staffService'; // Reuse existing types

/**
 * Consolidated Staff page using the new BaseTable component and consolidated staff service
 */
const ConsolidatedStaffView: React.FC = () => {
  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { showNotification } = useNotification();
  
  // API calls using our new useSimplifiedApi hook
  const { 
    data: staffList, 
    loading, 
    error, 
    refetch: refreshStaff 
  } = useSimplifiedApi(
    () => consolidatedStaffService.getAll(),
    { 
      cacheKey: 'all-staff',
      showErrorNotification: true,
      transform: response => response.data
    }
  );
  
  // API mutation calls
  const { mutate: createStaff, loading: createLoading } = useSimplifiedApiMutation(
    (staff: StaffMember) => consolidatedStaffService.create(staff),
    {
      onSuccess: () => {
        showNotification({ 
          message: 'Staff member created successfully', 
          type: 'success' 
        });
        refreshStaff();
        setDialogOpen(false);
      }
    }
  );
  
  const { mutate: updateStaff, loading: updateLoading } = useSimplifiedApiMutation(
    (params: { id: number; staff: StaffMember }) => 
      consolidatedStaffService.update(params.id, params.staff),
    {
      onSuccess: () => {
        showNotification({ 
          message: 'Staff member updated successfully', 
          type: 'success' 
        });
        refreshStaff();
        setDialogOpen(false);
      }
    }
  );
  
  const { mutate: deleteStaff, loading: deleteLoading } = useSimplifiedApiMutation(
    (id: number) => consolidatedStaffService.delete(id),
    {
      onSuccess: () => {
        showNotification({ 
          message: 'Staff member deleted successfully', 
          type: 'success' 
        });
        refreshStaff();
        setConfirmDeleteOpen(false);
      }
    }
  );
  
  const { mutate: bulkCreateStaff, loading: bulkCreateLoading } = useSimplifiedApiMutation(
    (staffList: StaffMember[]) => consolidatedStaffService.bulkCreate(staffList),
    {
      onSuccess: () => {
        showNotification({ 
          message: 'Staff members imported successfully', 
          type: 'success' 
        });
        refreshStaff();
        setBulkUploadDialogOpen(false);
      }
    }
  );
    // Table columns configuration
  const columns = [
    {
      id: 'id' as keyof StaffMember,
      label: 'ID',
      sortable: true,
      minWidth: 70,
      format: (value: any) => value || 'N/A'
    },
    {
      id: 'staffId' as keyof StaffMember,
      label: 'Staff ID',
      sortable: true,
      minWidth: 100
    },
    {
      id: 'firstName' as keyof StaffMember,
      label: 'First Name',
      sortable: true,
      minWidth: 120
    },
    {
      id: 'lastName' as keyof StaffMember,
      label: 'Last Name',
      sortable: true,
      minWidth: 120
    },
    {
      id: 'email' as keyof StaffMember,
      label: 'Email',
      sortable: true,
      minWidth: 200
    },
    {
      id: 'roleName' as keyof StaffMember,
      label: 'Role',
      sortable: true,
      minWidth: 120,
      format: (value: any) => (
        <Chip 
          label={value || 'Unknown'} 
          color={getRoleColor(value)}
          size="small"
        />
      )
    },
    {
      id: 'employmentStatus' as keyof StaffMember,
      label: 'Status',
      sortable: true,
      minWidth: 120,
      format: (value: any) => (
        <Chip 
          label={value || 'UNKNOWN'} 
          color={getStatusColor(value as EmploymentStatus)} 
          size="small"
        />
      )
    },
    {
      id: 'actions' as string,
      label: 'Actions',
      sortable: false,
      minWidth: 120,
      align: 'center' as 'center',
      format: (_: any, row: StaffMember) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={() => handleEdit(row)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={() => handleDeleteClick(row)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];
  
  // Helper functions
  const getRoleColor = (role: string): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
    switch (role) {
      case 'TEACHER': return 'primary';
      case 'PRINCIPAL': return 'secondary';
      case 'ADMIN_OFFICER': return 'success';
      case 'MANAGEMENT': return 'info';
      case 'ACCOUNT_OFFICER': return 'warning';
      case 'LIBRARIAN': return 'error';
      default: return 'default';
    }
  };
  
  const getStatusColor = (status: EmploymentStatus): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
    switch (status) {
      case EmploymentStatus.ACTIVE: return 'success';
      case EmploymentStatus.ON_LEAVE: return 'info';
      case EmploymentStatus.SUSPENDED: return 'warning';
      case EmploymentStatus.TERMINATED: return 'error';
      case EmploymentStatus.RETIRED: return 'secondary';
      case EmploymentStatus.RESIGNED: return 'default';
      default: return 'default';
    }
  };
  
  // Event handlers
  const handleAddClick = () => {
    setSelectedStaff(null);
    setDialogOpen(true);
  };
  
  const handleEdit = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setDialogOpen(true);
  };
  
  const handleDeleteClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setConfirmDeleteOpen(true);
  };
  
  const handleSubmit = async (staff: StaffMember) => {
    if (selectedStaff && selectedStaff.id) {
      await updateStaff({ id: selectedStaff.id, staff });
    } else {
      await createStaff(staff);
    }
  };
  
  const handleBulkUpload = async (staffMembers: StaffMember[]) => {
    await bulkCreateStaff(staffMembers);
  };
  
  const handleConfirmDelete = async () => {
    if (selectedStaff && selectedStaff.id) {
      await deleteStaff(selectedStaff.id);
    }
  };
  
  // Render
  if (loading && !staffList) {
    return <Loading />;
  }

  if (error && !staffList) {
    return <ErrorMessage message="Failed to load staff data." onRetry={refreshStaff} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Staff Management
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Staff
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => setBulkUploadDialogOpen(true)}
          >
            Bulk Upload
          </Button>
        </Stack>
      </Stack>

      <BaseTable
        columns={columns}
        data={staffList || []}
        loading={loading}
        onRefresh={refreshStaff}
        searchEnabled={true}
        searchPlaceholder="Search staff..."
        defaultSortBy="lastName"
        defaultSortDirection="asc"
        title="Staff List"
        emptyMessage="No staff members found"
      />

      {/* Staff Dialog */}
      <StaffDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedStaff || undefined}
        loading={createLoading || updateLoading}
      />

      {/* Bulk Upload Dialog */}
      <BulkStaffUploadDialog
        open={bulkUploadDialogOpen}
        onClose={() => setBulkUploadDialogOpen(false)}
        onSubmit={handleBulkUpload}
        loading={bulkCreateLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Delete Staff Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedStaff?.firstName} {selectedStaff?.lastName}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained" 
            disabled={deleteLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsolidatedStaffView;
