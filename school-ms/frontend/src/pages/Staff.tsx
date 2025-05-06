import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useApi, useApiMutation } from '../hooks/useApi';
import { staffService, StaffMember } from '../services/staffService';
import DataTable, { Column } from '../components/DataTable';
import StaffDialog from '../components/dialogs/StaffDialog';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useNotification } from '../context/NotificationContext';
import { hasPermission } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';

const Staff: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const {
    data: staffList,
    loading,
    error,
    refresh
  } = useApi<StaffMember[]>(() => staffService.getAll(), {
    cacheKey: 'staffList'
  });

  const { mutate: createStaff, loading: createLoading } = useApiMutation(
    (data: StaffMember) => staffService.create(data),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Staff member created successfully' });
        setDialogOpen(false);
        refresh();
      },
      onError: (error) => {
        showNotification({ 
          type: 'error', 
          message: `Failed to create staff member: ${error.message}` 
        });
      }
    }
  );

  const { mutate: updateStaff, loading: updateLoading } = useApiMutation(
    (data: StaffMember) => staffService.update(data.id!, data),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Staff member updated successfully' });
        setDialogOpen(false);
        setSelectedStaff(null);
        refresh();
      },
      onError: (error) => {
        showNotification({ 
          type: 'error', 
          message: `Failed to update staff member: ${error.message}` 
        });
      }
    }
  );

  const { mutate: deleteStaff, loading: deleteLoading } = useApiMutation(
    (id: number) => staffService.delete(id),
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Staff member deleted successfully' });
        setConfirmDeleteOpen(false);
        setSelectedStaff(null);
        refresh();
      },
      onError: (error) => {
        showNotification({ 
          type: 'error', 
          message: `Failed to delete staff member: ${error.message}` 
        });
      }
    }
  );

  const handleEdit = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setDialogOpen(true);
  };

  const handleDelete = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setConfirmDeleteOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedStaff(null);
  };

  const confirmDelete = () => {
    if (selectedStaff?.id) {
      deleteStaff(selectedStaff.id);
    }
  };

  const handleSubmit = async (data: StaffMember) => {
    if (selectedStaff?.id) {
      await updateStaff({...data, id: selectedStaff.id});
    } else {
      await createStaff(data);
    }
  };

  // Format staff roles for display
  const formatRole = (role: string) => {
    return role?.replace(/_/g, ' ');
  };

  const formatTeacherSubjects = (staff: StaffMember) => {
    if (staff.role !== 'TEACHER' || !staff.teacherDetails?.subjects) return '';
    
    return staff.teacherDetails.subjects;
  };

  const getStaffAvatar = (staff: StaffMember) => {
    if (!staff) return '';
    
    // Return initials for avatar
    const firstInitial = staff.firstName ? staff.firstName.charAt(0) : '';
    const lastInitial = staff.lastName ? staff.lastName.charAt(0) : '';
    
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const getStaffFullName = (staff: StaffMember) => {
    return `${staff.firstName} ${staff.lastName}`;
  };

  const getAvatarColor = (role: string) => {
    switch(role) {
      case 'TEACHER':
        return '#2196f3'; // blue
      case 'PRINCIPAL':
        return '#9c27b0'; // purple
      case 'ADMIN_OFFICER':
        return '#4caf50'; // green
      case 'MANAGEMENT':
        return '#ff9800'; // orange
      case 'ACCOUNT_OFFICER':
        return '#f44336'; // red
      case 'LIBRARIAN':
        return '#795548'; // brown
      default:
        return '#9e9e9e'; // grey
    }
  };

  // Role colors for consistent display
  const roleColors = {
    'Teacher': 'primary',
    'Principal': 'secondary',
    'Admin Officer': 'info',
    'Management': 'warning',
    'Account Officer': 'error',
    'Librarian': 'success'
  };

  // Filter staff based on active filter
  const filteredStaffList = useMemo(() => {
    if (!staffList) return [];
    if (!activeFilter) return staffList;

    // Special filters
    if (activeFilter === 'Total') return staffList;
    if (activeFilter === 'Active') return staffList.filter(s => s.isActive);
    
    // Filter by role
    return staffList.filter(staff => {
      const normalizedRole = staff.role.replace('_', ' ');
      return (
        normalizedRole.toUpperCase() === activeFilter.toUpperCase() || 
        staff.role.toUpperCase() === activeFilter.replace(' ', '_').toUpperCase()
      );
    });
  }, [staffList, activeFilter]);

  // Create role statistics for the overview section
  const roleStatistics = useMemo(() => {
    if (!staffList) return [];
    
    const stats = [
      { label: 'Total', count: staffList.length, color: 'default' },
      { label: 'Active', count: staffList.filter(s => s.isActive).length, color: 'success' }
    ];
    
    // Add stats for each role
    Object.keys(roleColors).forEach(role => {
      const count = staffList.filter(staff => 
        staff.role === role.toUpperCase().replace(' ', '_') || staff.role === role
      ).length;
      
      stats.push({
        label: role,
        count,
        color: roleColors[role as keyof typeof roleColors]
      });
    });
    
    return stats;
  }, [staffList]);

  const handleFilterClick = (filter: string) => {
    if (activeFilter === filter) {
      // If clicking the active filter, clear it
      setActiveFilter(null);
    } else {
      // Set the new filter
      setActiveFilter(filter);
    }
  };

  const columns: Column<StaffMember>[] = [
    { 
      id: 'name', 
      label: 'Name',
      sortable: true,
      format: (_, staff) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar 
            sx={{ 
              bgcolor: getAvatarColor(staff.role),
              width: 35, 
              height: 35, 
              fontSize: '0.9rem'
            }}
          >
            {getStaffAvatar(staff)}
          </Avatar>
          <Typography variant="body2">
            {getStaffFullName(staff)}
          </Typography>
        </Box>
      )
    },
    { id: 'staffId', label: 'Staff ID', sortable: true },
    { 
      id: 'role', 
      label: 'Role', 
      sortable: true,
      format: (value: string) => (
        <Chip 
          label={formatRole(value)}
          size="small"
          color={value === 'TEACHER' ? 'primary' : 'default'}
          variant={value === 'TEACHER' ? 'filled' : 'outlined'}
        />
      )
    },
    { 
      id: 'department', 
      label: 'Department',
      sortable: true,
      format: (_, staff) => staff.role === 'TEACHER' ? staff.teacherDetails?.department : '-'
    },
    { 
      id: 'subjects', 
      label: 'Subjects',
      sortable: false,
      format: (_, staff) => {
        const subjects = formatTeacherSubjects(staff);
        if (!subjects) return '-';
        
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {subjects.split(',').map((subject, index) => (
              <Chip 
                key={index} 
                label={subject.trim()} 
                size="small" 
                variant="outlined"
              />
            ))}
          </Box>
        );
      }
    },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'phoneNumber', label: 'Contact', sortable: true },
    { 
      id: 'isActive', 
      label: 'Status', 
      sortable: true,
      format: (value: boolean) => (
        <Chip 
          label={value ? 'Active' : 'Inactive'}
          size="small"
          color={value ? 'success' : 'error'}
        />
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      format: (_, staff) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasPermission(user?.role || '', 'MANAGE_STAFF') && (
            <>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => handleEdit(staff)} color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => handleDelete(staff)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          
          {staff.role === 'TEACHER' && (
            <>
              <Tooltip title="View Schedule">
                <IconButton size="small" color="default">
                  <ScheduleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Classes">
                <IconButton size="small" color="info">
                  <SchoolIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          
          <Tooltip title="Contact">
            <IconButton size="small" color="success">
              <EmailIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  if (loading && !staffList) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error.message} onRetry={refresh} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Staff Management</Typography>
        {hasPermission(user?.role || '', 'MANAGE_STAFF') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add Staff Member
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Staff Overview</Typography>
          <Grid container spacing={1}>
            {roleStatistics.map((stat, index) => (
              <Grid item key={index}>
                <Chip 
                  label={`${stat.label}: ${stat.count}`} 
                  color={stat.color as any} 
                  variant={activeFilter === stat.label ? 'filled' : 'outlined'}
                  sx={{ 
                    minWidth: 100,
                    cursor: 'pointer',
                    fontWeight: activeFilter === stat.label ? 'bold' : 'normal'
                  }}
                  onClick={() => handleFilterClick(stat.label)}
                />
              </Grid>
            ))}
          </Grid>
          {activeFilter && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" mr={1}>
                Filtered by:
              </Typography>
              <Chip 
                label={activeFilter} 
                size="small"
                onDelete={() => setActiveFilter(null)}
              />
            </Box>
          )}
        </Box>
      </Paper>

      <Paper>
        <DataTable
          columns={columns}
          data={filteredStaffList || []}
          loading={loading}
          onRefresh={refresh}
          searchPlaceholder="Search staff..."
          initialSortBy="role"
        />
      </Paper>

      <StaffDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        initialData={selectedStaff}
        loading={createLoading || updateLoading}
      />

      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedStaff ? getStaffFullName(selectedStaff) : 'this staff member'}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;