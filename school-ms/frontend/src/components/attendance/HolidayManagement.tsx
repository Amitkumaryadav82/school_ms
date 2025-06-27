import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Event as EventIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { employeeAttendanceService, HolidayDTO, HolidayType } from '../../services/employeeAttendanceService';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';

const HolidayManagement: React.FC = () => {
  const { showNotification } = useNotification();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayDTO | null>(null);
  const [holidayForm, setHolidayForm] = useState<Partial<HolidayDTO>>({
    date: '',
    name: '',
    description: '',
    type: HolidayType.NATIONAL_HOLIDAY
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  // API calls
  const { data: holidays, loading, error, refetch } = useApi(
    () => employeeAttendanceService.getHolidaysCalendar(selectedYear),
    { dependencies: [selectedYear] }
  );
  const { data: holidayTypes } = useApi(
    () => employeeAttendanceService.getHolidayTypes(),
    { dependencies: [] }
  );

  // Mutations
  const { mutateAsync: addHoliday } = useApiMutation(
    (holiday: HolidayDTO) => employeeAttendanceService.addHoliday(holiday),
    {
      onSuccess: () => {
        showNotification('Holiday added successfully', 'success');
        refetch();
        setDialogOpen(false);
        resetForm();
      },
      onError: (error) => {
        showNotification(`Failed to add holiday: ${error.message}`, 'error');
      }
    }
  );

  const { mutateAsync: updateHoliday } = useApiMutation(
    ({ id, holiday }: { id: number, holiday: HolidayDTO }) => 
      employeeAttendanceService.updateHoliday(id, holiday),
    {
      onSuccess: () => {
        showNotification('Holiday updated successfully', 'success');
        refetch();
        setDialogOpen(false);
        resetForm();
      },
      onError: (error) => {
        showNotification(`Failed to update holiday: ${error.message}`, 'error');
      }
    }
  );

  const { mutateAsync: deleteHoliday } = useApiMutation(
    (id: number) => employeeAttendanceService.deleteHoliday(id),
    {
      onSuccess: () => {
        showNotification('Holiday deleted successfully', 'success');
        refetch();
        setConfirmDeleteDialogOpen(false);
      },
      onError: (error) => {
        showNotification(`Failed to delete holiday: ${error.message}`, 'error');
      }
    }
  );

  const { mutateAsync: addDefaultHolidays } = useApiMutation(
    (year: number) => employeeAttendanceService.addDefaultHolidays(year),
    {
      onSuccess: () => {
        showNotification('Default holidays added successfully', 'success');
        refetch();
      },
      onError: (error) => {
        showNotification(`Failed to add default holidays: ${error.message}`, 'error');
      }
    }
  );

  // Handle form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!holidayForm.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!holidayForm.name) {
      newErrors.name = 'Holiday name is required';
    }
    
    if (!holidayForm.type) {
      newErrors.type = 'Holiday type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setHolidayForm({
      date: '',
      name: '',
      description: '',
      type: HolidayType.NATIONAL_HOLIDAY
    });
    setSelectedHoliday(null);
    setErrors({});
  };

  // Open dialog to add new holiday
  const handleOpenAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Open dialog to edit existing holiday
  const handleOpenEditDialog = (holiday: SchoolHoliday) => {
    setSelectedHoliday(holiday);
    setHolidayForm({
      id: holiday.id,
      date: holiday.date,
      name: holiday.name,
      description: holiday.description,
      type: holiday.type
    });
    setDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (holiday: SchoolHoliday) => {
    setSelectedHoliday(holiday);
    setConfirmDeleteDialogOpen(true);
  };

  // Handle form field changes
  const handleFormChange = (field: keyof SchoolHoliday, value: any) => {
    setHolidayForm((prev) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for the field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  // Handle date change
  const handleDateChange = (newDate: any) => {
    if (newDate) {
      const dayjsDate = dayjs(newDate);
      handleFormChange('date', dayjsDate.format('YYYY-MM-DD'));
    }
  };

  // Handle save holiday (add or update)
  const handleSaveHoliday = async () => {
    if (!validateForm()) return;
    
    try {
      if (selectedHoliday && selectedHoliday.id) {
        await updateHoliday({ id: selectedHoliday.id, holiday: holidayForm as SchoolHoliday });
      } else {
        await addHoliday(holidayForm as SchoolHoliday);
      }
    } catch (error) {
      console.error('Error saving holiday:', error);
    }
  };

  // Handle delete holiday
  const handleDeleteHoliday = async () => {
    if (!selectedHoliday || !selectedHoliday.id) return;
    
    try {
      await deleteHoliday(selectedHoliday.id);
    } catch (error) {
      console.error('Error deleting holiday:', error);
    }
  };

  // Handle add default holidays
  const handleAddDefaultHolidays = async () => {
    try {
      await addDefaultHolidays(selectedYear);
    } catch (error) {
      console.error('Error adding default holidays:', error);
    }
  };

  // Get month name from index
  const getMonthName = (index: number): string => {
    return new Date(2000, index, 1).toLocaleString('default', { month: 'long' });
  };

  // Get holiday type color
  const getHolidayTypeColor = (type: HolidayType) => {
    switch (type) {
      case HolidayType.NATIONAL_HOLIDAY: return 'primary';
      case HolidayType.RELIGIOUS_HOLIDAY: return 'secondary';
      case HolidayType.SCHOOL_FUNCTION: return 'success';
      case HolidayType.OTHER: return 'default';
      default: return 'default';
    }
  };

  // Loading state
  if (loading) {
    return <Loading />;
  }

  // Error state
  if (error) {
    return <ErrorMessage message="Failed to load holidays data." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2">
          School Holidays Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl 
            sx={{ 
              width: '150px',  // Set a specific width to match the button
              mr: 2 
            }} 
            size="medium"
          >
            <InputLabel id="year-select-label">Year</InputLabel>
            <Select
              labelId="year-select-label"
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              sx={{ height: '40px' }}  // Set a specific height to match the button
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            size="medium"
            sx={{ height: '40px' }}  // Match the height with the Year dropdown
          >
            Add Holiday
          </Button>
        </Box>
      </Box>
      
      {holidays && (holidays as any).allHolidays ? (
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Table stickyHeader aria-label="holidays table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Holiday Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(holidays as any).allHolidays.map((holiday: any) => (
                  <TableRow hover key={holiday.id}>
                    <TableCell>
                      {new Date(holiday.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">{holiday.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={holiday.type.replace('_', ' ')} 
                        size="small"
                        color={getHolidayTypeColor(holiday.type) as any}
                      />
                    </TableCell>
                    <TableCell>{holiday.description || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenEditDialog(holiday)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDeleteDialog(holiday)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      ) : (
        <Alert severity="info">No holidays found for {selectedYear}.</Alert>
      )}

      {/* Add/Edit Holiday Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedHoliday ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Holiday Date"
                value={holidayForm.date ? dayjs(holidayForm.date) : null}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date
                  }
                }}
              />
            </LocalizationProvider>
            
            <TextField
              label="Holiday Name"
              value={holidayForm.name || ''}
              onChange={(e) => handleFormChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={holidayForm.description || ''}
              onChange={(e) => handleFormChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            
            <FormControl fullWidth error={!!errors.type} required>
              <InputLabel>Holiday Type</InputLabel>
              <Select
                value={holidayForm.type || ''}
                label="Holiday Type"
                onChange={(e) => handleFormChange('type', e.target.value)}
              >
                {Object.values(HolidayType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
              {!!errors.type && <FormHelperText>{errors.type}</FormHelperText>}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveHoliday}>
            {selectedHoliday ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={() => setConfirmDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Holiday</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the holiday "{selectedHoliday?.name}" on {selectedHoliday && new Date(selectedHoliday.date).toLocaleDateString()}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteHoliday}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HolidayManagement;
