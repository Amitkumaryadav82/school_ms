// @ts-check
import {
    Add as AddIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Schedule as ScheduleIcon,
    School as SchoolIcon
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import DataTable, { Column } from '../components/DataTable';
import AuthDebugger from '../components/debug/AuthDebugger';
import BulkStaffUploadDialog from '../components/dialogs/BulkStaffUploadDialog';
import StaffDialog from '../components/dialogs/StaffDialog';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import config from '../config/environment';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useApi, useApiMutation } from '../hooks/useApi';
import { api } from '../services/api';
import { hasStaffStatusUpdatePermission, parseJwt } from '../services/authService';
import { ALLOWED_EMPLOYMENT_STATUSES, EmploymentStatus, StaffMember, staffService } from '../services/staffService';
import { hasPermission } from '../utils/permissions';
import { createTestStaffMember, debugStaffResponse, inspectObject } from '../utils/staffDebug';
import { formatRole, getAvatarColor } from './StaffHelper';

/**
 * IMPORTANT DEVELOPER NOTE:
 * 
 * This component handles the staff management functionality. We've added defensive
 * programming to handle cases where the `/api/staff` endpoint might return a single
 * object instead of an array, which was causing the error:
 * "TypeError: staffList.filter is not a function"
 * 
 * The fixes ensure we always operate on arrays in the component, with:
 * 1. A transformResponse handler in useApi
 * 2. Safety checks in useMemo hooks
 * 3. An updated staffService.getAll() method
 * 
 * If you experience any issues, check the server response format for the staff endpoint.
 */

const Staff: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Partial<StaffMember> | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { user } = useAuth();
  // Add debug logging to track user role and permissions  
  useEffect(() => {
    console.log('Current user:', user);
    console.log('Has MANAGE_STAFF permission:', 
      user && user.role ? hasPermission(user.role, 'MANAGE_STAFF') : false);
  }, [user]);

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
      onSuccess: async (created) => {
        showNotification({ type: 'success', message: 'Staff member created successfully' });
        // If the dialog sent pending mappings, persist them now
        try {
          const subjectIds = (created as any).__subjectIds || (selectedStaff as any)?.__subjectIds;
          const classMappings = (created as any).__classMappings || (selectedStaff as any)?.__classMappings;

          // Resolve teacherDetailsId from response (prefer created.teacherDetails.id)
          const teacherDetailsId = (created as any)?.teacherDetails?.id;

          if (teacherDetailsId) {
            if (Array.isArray(subjectIds) && subjectIds.length > 0) {
              await api.put<void>(`/api/staff/teachers/${teacherDetailsId}/subjects`, subjectIds);
            }
            if (Array.isArray(classMappings) && classMappings.length > 0) {
              await api.put<void>(`/api/staff/teachers/${teacherDetailsId}/classes`, classMappings);
            }
          }
        } catch (e) {
          console.error('Failed to persist mappings after creation', e);
          showNotification({ type: 'warning', message: 'Created staff, but failed to save subjects/classes' });
        }
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

  const { mutate: bulkCreateStaff, loading: bulkCreateLoading } = useApiMutation(
    (data: StaffMember[]) => staffService.bulkCreate(data),
    {
      onSuccess: (result) => {
        const { created, updated, errors } = result;
        
        if (errors && errors.length > 0) {
          showNotification({ 
            type: 'warning', 
            message: `Partially completed: Created ${created}, Updated ${updated}, Failed ${errors.length} records` 
          });
        } else {
          showNotification({ 
            type: 'success', 
            message: `Successfully imported staff data: Created ${created}, Updated ${updated} records` 
          });
        }
        
        setBulkUploadDialogOpen(false);
        refresh();
      },
      onError: (error) => {
        showNotification({ 
          type: 'error', 
          message: `Failed to import staff data: ${error.message}` 
        });
      }
    }
  );

  const { mutate: updateStaff, loading: updateLoading } = useApiMutation(
    (data: StaffMember) => staffService.update(data.id!, data),
    {      onSuccess: () => {
        showNotification({ type: 'success', message: 'Staff member updated successfully' });
        setDialogOpen(false);
        setSelectedStaff(undefined);
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
    {      onSuccess: () => {
        showNotification({ type: 'success', message: 'Staff member deleted successfully' });
        setConfirmDeleteOpen(false);
        setSelectedStaff(undefined);
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
  const { mutate: toggleStaffStatus, loading: toggleStatusLoading } = useApiMutation(
    (data: { id: number; isActive: boolean }) => {
      const staffUpdate: Partial<StaffMember> = { isActive: data.isActive };
      return staffService.update(data.id, staffUpdate as StaffMember);
    },
    {
      onSuccess: () => {
        showNotification({ type: 'success', message: 'Staff status updated successfully' });
        refresh();
      },
      onError: (error) => {
        showNotification({ 
          type: 'error', 
          message: `Failed to update staff status: ${error.message}` 
        });
      }
    }
  );

  const { mutate: updateEmploymentStatus, loading: updateStatusLoading } = useApiMutation(
    (data: { id: number; status: EmploymentStatus }) => {
      // Add detailed request logging
      console.log('Attempting to update employment status with:', {
        staffId: data.id,
        newStatus: data.status,
        currentTime: new Date().toISOString()
      });
      return staffService.updateEmploymentStatus(data.id, data.status);
    },
    {
      onSuccess: (result) => {
        console.log('Employment status update succeeded:', {
          result,
          timestamp: new Date().toISOString()
        });
        showNotification({ type: 'success', message: 'Employment status updated successfully' });
        refresh();
      },
      onError: (error: any) => {
        console.error('Employment status update failed:', {
          error,
          timestamp: new Date().toISOString()
        });
        
        // Extract server error message if available
        let errorMessage = error.message || 'An unknown error occurred';
        
        if (error.response && error.response.data) {
          // Check for API-specific error format
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
        }
        
        showNotification({ 
          type: 'error', 
          message: `Failed to update employment status: ${errorMessage}` 
        });
      }
    }
  );

  const handleEmploymentStatusChange = async (staffId: number, newStatus: string) => {
    console.log(`[DEBUG] [${new Date().toISOString()}] Attempting to update employment status for staff ID: ${staffId} to ${newStatus}`);
    
    // Advanced permission check using specialized function
    if (!hasStaffStatusUpdatePermission()) {
      console.error(`[DEBUG] [${new Date().toISOString()}] Permission denied: User lacks required role (ADMIN or HR_MANAGER) for staff status updates`);
      
      // Log JWT details for debugging
      debugPermissions();
      
      // Show user-friendly message
      showNotification({ 
        type: 'error', 
        message: "You don't have permission to update employment status. This action requires ADMIN or HR_MANAGER role." 
      });
      return;
    }

    console.log(`[DEBUG] [${new Date().toISOString()}] Permission check passed. User has ADMIN or HR_MANAGER role.`);
    
    try {
      // Log attempt with timestamp and additional token information
      console.log(`[DEBUG] [${new Date().toISOString()}] Calling staffService.updateEmploymentStatus with ID: ${staffId}, status: ${newStatus}`);
      
      // Attempt to decode and log the current auth token before making the request
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const tokenDetails = parseJwt(token);
          console.log('[DEBUG] Auth token details before request:', {
            exp: new Date(tokenDetails.exp * 1000).toISOString(),
            roles: tokenDetails.roles || tokenDetails.authorities,
            sub: tokenDetails.sub,
            tokenLength: token.length,
            tokenPrefix: token.substring(0, 15) + '...'
          });
        } else {
          console.error('[DEBUG] No authentication token found in localStorage');
        }
      } catch (tokenError) {
        console.error('[DEBUG] Error parsing authentication token:', tokenError);
      }
      
      await updateEmploymentStatus({ id: staffId, status: newStatus as EmploymentStatus });
      console.log(`[DEBUG] [${new Date().toISOString()}] Employment status update successful for staff ID: ${staffId}`);
    } catch (error: any) {
      console.error(`[DEBUG] [${new Date().toISOString()}] Error occurred while updating employment status:`, error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('[DEBUG] Server response error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data
        });
        
        // Check for specific API error responses
        if (error.response.status === 400 && error.response.data && error.response.data.message) {
          // This is likely our validation error from the backend
          console.error('[DEBUG] Validation error from backend:', error.response.data.message);
          showNotification({
            type: 'error',
            message: error.response.data.message
          });
        } else if (error.response.status === 403) {
          console.error('[DEBUG] 403 Forbidden error detected. Possible causes:');
          console.error('1. Token expired during the request');
          console.error('2. Token does not contain required roles (ADMIN or HR_MANAGER)');
          console.error('3. Backend permission check differs from frontend');
          
          showNotification({
            type: 'error',
            message: 'You do not have permission to perform this action'
          });
          
          // Re-check permissions after error
          debugPermissions();
        } else {
          // Generic server error
          showNotification({
            type: 'error',
            message: `Server error: ${error.response.statusText || 'Unknown error'}`
          });
        }
      } else if (error.request) {
        console.error('[DEBUG] Request was made but no response received:', error.request);
        showNotification({
          type: 'error',
          message: 'Network error: Could not connect to the server'
        });
      } else {
        console.error('[DEBUG] Error setting up the request:', error.message);
        showNotification({
          type: 'error',
          message: `Error: ${error.message}`
        });
      }
    }
  };

  // Add a debug function to check user permissions
  const debugPermissions = () => {
    if (!user) {
      console.log('Debug: No user is logged in');
      return false;
    }
    
    console.log('Debug: User permissions check', {
      userId: user.id,
      userName: user?.username || 'unknown',
      userRole: user?.role || 'none',
      token: localStorage.getItem('token') ? 'Present (first 10 chars): ' + 
        localStorage.getItem('token')?.substring(0, 10) + '...' : 'Missing',
      hasManageStaff: user?.role ? hasPermission(user.role, 'MANAGE_STAFF') : false,
      timestamp: new Date().toISOString()
    });
    
    return user?.role ? hasPermission(user.role, 'MANAGE_STAFF') : false;
  };

  // Use effect to run the debug check when component loads
  useEffect(() => {
    debugPermissions();
  }, [user]);  const handleEdit = async (staff: StaffMember) => {
    debugPermissions(); // Debug check permissions
    
    try {
      // Always show loading state
      showNotification({ type: 'info', message: 'Loading staff details...' });
      
      console.log('Original staff data:', staff);
      
      // Get a fresh complete staff record from the server by ID
      if (staff.id) {
        try {
          // Direct API call bypassing the hook system to get raw data
          const response = await fetch(`${config.apiUrl}/api/staff/${staff.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to load staff details: ${response.status} ${response.statusText}`);
          }
          
          const fullStaffData = await response.json();
          console.log('API Raw response for staff:', fullStaffData);
          
          // Create a completely filled staff member object with all fields
          // This ensures all fields have values even if API didn't return them
          const completeStaffData: StaffMember = {
            // Copy existing fields from API response
            ...staff,
            ...fullStaffData,
            // Explicitly set values for the fields that weren't showing up
            emergencyContact: fullStaffData.emergencyContact || '',
            qualifications: fullStaffData.qualifications || '',
            pfUAN: fullStaffData.pfUAN || '',
            gratuity: fullStaffData.gratuity || '',
            basicSalary: fullStaffData.basicSalary !== undefined ? Number(fullStaffData.basicSalary) : 0,
            hra: fullStaffData.hra !== undefined ? Number(fullStaffData.hra) : 0,
            da: fullStaffData.da !== undefined ? Number(fullStaffData.da) : 0,
            ta: fullStaffData.ta !== undefined ? Number(fullStaffData.ta) : 0,
            otherAllowances: fullStaffData.otherAllowances !== undefined ? Number(fullStaffData.otherAllowances) : 0,
            bloodGroup: fullStaffData.bloodGroup || ''
          };
          
          console.log('Setting complete staff data for dialog:', completeStaffData);
          
          // Set the staff data for the dialog
          setSelectedStaff(completeStaffData);
          
        } catch (err) {
          console.error('Error fetching staff details:', err);
          // Fallback to using the original staff data with default values added
          const fallbackData: StaffMember = {
            ...staff,
            emergencyContact: '',
            qualifications: '',
            pfUAN: '',
            gratuity: '',
            basicSalary: 0,
            hra: 0,
            da: 0,
            ta: 0,
            otherAllowances: 0,
            bloodGroup: ''
          };
          
          setSelectedStaff(fallbackData);
          showNotification({ type: 'warning', message: 'Could not load complete staff details, using partial data' });
        }
      } else {
        // For new staff, just use the default values
        setSelectedStaff({
          ...staff,
          emergencyContact: '',
          qualifications: '',
          pfUAN: '',
          gratuity: '',
          basicSalary: 0,
          hra: 0,
          da: 0,
          ta: 0,
          otherAllowances: 0,
          bloodGroup: ''
        });
      }
      
      // Open the dialog
      setDialogOpen(true);
      
    } catch (error) {
      console.error('Error in handleEdit:', error);
      showNotification({ type: 'error', message: 'Failed to prepare staff data for editing' });
    }
  };

  const handleDelete = (staff: StaffMember) => {
    debugPermissions(); // Debug check permissions
    setSelectedStaff(staff);
    setConfirmDeleteOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedStaff(undefined);
  };

  const handleBulkUploadDialogClose = () => {
    setBulkUploadDialogOpen(false);
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

  const handleBulkSubmit = async (staffMembers: StaffMember[]) => {
    await bulkCreateStaff(staffMembers);
  };

  const handleToggleStatus = (staff: StaffMember) => {
    if (staff.id) {
      toggleStaffStatus({ id: staff.id, isActive: !staff.isActive });
    }
  };

  const handleStatusChange = (staff: StaffMember, status: EmploymentStatus) => {
    // Enhanced debug logging
    console.log('Status change requested:', {
      staffId: staff.id,
      staffName: `${staff.firstName} ${staff.lastName}`,
      currentStatus: staff.employmentStatus,
      requestedStatus: status,
      timestamp: new Date().toISOString()
    });
    
    // Debug the current user permissions
    const hasManageStaffPermission = debugPermissions();
    
    // Adding more robust permission checking
    if (!user) {
      console.error('Permission denied: No authenticated user');
      showNotification({ 
        type: 'error', 
        message: 'Authentication required: Please log in again' 
      });
      refresh(); // Refresh to restore original view
      return;
    }
    
    // Double-check permissions before proceeding with the API call
    if (!hasManageStaffPermission) {
      console.error(`Permission denied: User role ${user.role} does not have MANAGE_STAFF permission`);
      showNotification({ 
        type: 'error', 
        message: 'You do not have permission to update employment status' 
      });
      refresh(); // Refresh to reset UI
      return;
    }
    
    // Check for valid transitions
    if (staff.employmentStatus && staff.employmentStatus !== EmploymentStatus.ACTIVE && 
        status !== staff.employmentStatus) {
      console.error(`Invalid status transition from ${staff.employmentStatus} to ${status}`);
      showNotification({ 
        type: 'error', 
        message: `Invalid status transition: Only ACTIVE staff can be changed to other statuses` 
      });
      refresh(); // Refresh to reset UI
      return;
    }
    
    // Confirm the status change if it's a terminal status (terminated, resigned, retired)
    if (status === EmploymentStatus.TERMINATED || 
        status === EmploymentStatus.RESIGNED || 
        status === EmploymentStatus.RETIRED) {
      
      // Ask for confirmation before proceeding
      if (!window.confirm(`Are you sure you want to change ${staff.firstName} ${staff.lastName}'s status to ${status}? This action cannot be reversed.`)) {
        console.log('Status change cancelled by user');
        return;
      }
    }
    
    if (staff.id) {
      console.log(`Proceeding with status update for staff ${staff.id} to ${status}`);
      handleEmploymentStatusChange(staff.id, status);
    }
  };

  // Helper function to get color for employment status
  const getStatusColor = (status?: EmploymentStatus): "success" | "warning" | "error" | "default" => {
    if (!status) return "default";
    
    switch (status) {
      case EmploymentStatus.ACTIVE:
        return "success";
      case EmploymentStatus.TERMINATED:
      case EmploymentStatus.RETIRED:
      case EmploymentStatus.RESIGNED:
        return "error";
      default:
        // For any legacy statuses still in the database
        if (status === EmploymentStatus.INACTIVE) return "error";
        if (status === EmploymentStatus.PROBATION || 
            status === EmploymentStatus.CONTRACT || 
            status === EmploymentStatus.LEAVE_OF_ABSENCE) return "warning";
        return "default";
    }
  };  // Format staff roles for display is now imported from StaffHelper.ts
  const formatTeacherSubjects = (staff: StaffMember) => {
    // Check if staff is a teacher by role (handling different formats of role)
    const roleName = getRoleNameFromStaff(staff);
    const isTeacher = roleName.toLowerCase().includes('teacher');
    
    // Get subjects from teacherDetails first, if available
    if (isTeacher && staff.teacherDetails?.subjects) {
      return staff.teacherDetails.subjects;
    }
    
    // Check if subjects are stored directly in staff.subjects (added in the bulk upload)
    if (isTeacher && (staff as any).subjects) {
      return (staff as any).subjects;
    }
    
    // Check teacherDetails.subjectsTaught as another possible location
    if (isTeacher && staff.teacherDetails?.subjectsTaught) {
      return staff.teacherDetails.subjectsTaught;
    }
    
    // Finally check for a legacy pattern directly in the staff object
    if (isTeacher && (staff as any).subjectsTaught) {
      return (staff as any).subjectsTaught;
    }
      return '-';
  };

  const getStaffAvatar = (staff: StaffMember) => {
    if (!staff) return '';
    
    // Return initials for avatar
    const firstInitial = staff.firstName ? staff.firstName.charAt(0) : '';
    const lastInitial = staff.lastName ? staff.lastName.charAt(0) : '';
    
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };  const getStaffFullName = (staff: Partial<StaffMember>) => {
    if (!staff) return 'Unknown Staff';
    
    // Check for fullName property first
    if (staff.fullName) return staff.fullName;
    
    // Handle potential data issues
    const firstName = staff.firstName || '';
    const lastName = staff.lastName || '';
    
    if (!firstName && !lastName) {
      // Try alternative fields
      const email = staff.email || '';
      if (email) {
        // Extract name from email if available
        const namePart = email.split('@')[0];
        return namePart.replace('.', ' ').replace('_', ' ');
      }
      return 'Unknown Staff';
    }
    
    return `${firstName} ${lastName}`.trim();
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
  
  // Helper function to extract role name from staff member
  const getRoleNameFromStaff = (staff: StaffMember): string => {
    let roleName: string | undefined = undefined;
    
    // Check if role is an object with name property (primary case from API)
    if (typeof staff.role === 'object' && staff.role) {
      if ((staff.role as any).name) {
        roleName = (staff.role as any).name;
      } else if ((staff.role as any).roleName) {
        roleName = (staff.role as any).roleName;
      }
    }
    // Check if role is a direct string (compatibility case)
    else if (typeof staff.role === 'string') {
      roleName = staff.role;
    }
    
    // If we didn't get a role name yet, check staffRole object (backup case)
    if (!roleName && (staff as any).staffRole) {
      const staffRole = (staff as any).staffRole;
      if (staffRole.name) {
        roleName = staffRole.name;
      } else if (staffRole.roleName) {
        roleName = staffRole.roleName;
      }
    }
    
    // Last resort checks
    if (!roleName) {
      if ((staff as any).roleName) {
        roleName = (staff as any).roleName;
      }
    }
    
    // If still nothing found, log the issue for debugging
    if (!roleName) {
      console.warn('Unable to extract role name from staff member:', {
        staffId: staff.staffId,
        name: `${staff.firstName} ${staff.lastName}`,
        role: staff.role,
        staffRole: (staff as any).staffRole
      });
      return '';
    }
    
    return roleName;
  };
  
  // Filter staff based on active filter
  const filteredStaffList = useMemo(() => {
    if (!staffList) return [];
    // Ensure staffList is an array
    const staffArray = Array.isArray(staffList) ? staffList : (staffList ? [staffList] : []);
    if (!activeFilter) return staffArray;
    
    // Handle special filter cases
    if (activeFilter === 'Total') return staffArray;
    if (activeFilter === 'Active') return staffArray.filter(s => s.isActive);

    // Filter by role name
    return staffArray.filter(staff => {
      const roleName = getRoleNameFromStaff(staff);
      if (!roleName) return false;
      
      // Normalize the stored role value - handle both formats
      const normalizedRole = roleName.replace(/_/g, ' ');
      
      // Normalize the filter value
      const normalizedFilter = activeFilter.toUpperCase();
      
      console.log('Filter debug:', {
        activeFilter,
        normalizedFilter,
        staffRole: staff.role,
        staffRoleObj: staff.staffRole,
        extractedRoleName: roleName,
        normalizedRole,
        comparison: {
          exact: normalizedRole.toUpperCase() === normalizedFilter,
          alternate: roleName.toUpperCase() === normalizedFilter,
          withUnderscores: roleName.toUpperCase() === normalizedFilter.replace(/ /g, '_'),
          contains: normalizedRole.toUpperCase().includes(normalizedFilter),
          containedIn: normalizedFilter.includes(normalizedRole.toUpperCase())
        }
      });
      
      // Multiple matching strategies for maximum compatibility
      return (
        normalizedRole.toUpperCase() === normalizedFilter || 
        roleName.toUpperCase() === normalizedFilter ||
        roleName.toUpperCase() === normalizedFilter.replace(/ /g, '_') ||
        normalizedRole.toUpperCase().includes(normalizedFilter) ||
        normalizedFilter.includes(normalizedRole.toUpperCase()) ||
        // Case insensitive match with more flexibility
        normalizedRole.toLowerCase().includes(activeFilter.toLowerCase()) ||
        activeFilter.toLowerCase().includes(normalizedRole.toLowerCase())
      );
    });
  }, [staffList, activeFilter]);

  // Create role statistics for the overview section
  const roleStatistics = useMemo(() => {
    if (!staffList) return [];
    
    // Ensure staffList is an array
    const staffArray = Array.isArray(staffList) ? staffList : (staffList ? [staffList] : []);
    
    const stats = [
      { label: 'Total', count: staffArray.length, color: 'default' },
      { label: 'Active', count: staffArray.filter(s => s.isActive).length, color: 'success' }
    ];
    // Add stats for each role
    Object.keys(roleColors).forEach(role => {
      const count = staffArray.filter(staff => {
        const roleName = getRoleNameFromStaff(staff);
        return roleName === role.toUpperCase().replace(' ', '_') || 
               roleName === role ||
               roleName.toLowerCase() === role.toLowerCase();
      }).length;
      
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
    { id: 'staffId', label: 'Staff ID', sortable: true },    { 
      id: 'role', 
      label: 'Role', 
      sortable: true,      format: (value, staff) => {
        // Use the imported helper function to extract role name
        const roleName = getRoleNameFromStaff(staff);
        
        // Log role data for debugging
        console.log('Role extraction:', {
          staffId: staff.staffId,
          name: `${staff.firstName} ${staff.lastName}`,
          extractedRoleName: roleName,
          rawRole: staff.role,
          staffRole: (staff as any).staffRole
        });
        
        console.log('Role debug for staff:', {
          staffId: staff.staffId,
          name: `${staff.firstName} ${staff.lastName}`,
          rawRole: staff.role,
          extractedRoleName: roleName,
          staffRoleObj: (staff as any).staffRole,
          value
        });
        
        // Format the role name for display
        const displayRole = roleName ? formatRole(roleName) : 'Unknown';
        
        console.log('Role debug:', { 
          displayRole, 
          originalValue: value, 
          staffRole: (staff as any).staffRole,
          roleProperty: staff.role
        });
        
        // Determine display styles based on role name
        let chipColor: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
        
        const roleNameLower = (roleName || '').toLowerCase();
        
        if (roleNameLower.includes('teacher')) {
          chipColor = "primary";
        } else if (roleNameLower.includes('principal')) {
          chipColor = "secondary";
        } else if (roleNameLower.includes('admin')) {
          chipColor = "info";
        } else if (roleNameLower.includes('management')) {
          chipColor = "warning";
        } else if (roleNameLower.includes('account')) {
          chipColor = "error";
        } else if (roleNameLower.includes('librarian')) {
          chipColor = "success";
        }
        
        return (
          <Chip 
            label={displayRole}
            size="small"
            color={chipColor}
            variant="filled"
          />
        );
      }
    },    { 
      id: 'department', 
      label: 'Department',
      sortable: true,
      format: (_, staff) => {
        // Check for department in multiple possible locations
        const department = staff.department || 
                           (staff.teacherDetails?.department) || 
                           '-';
        
        console.log('Department debug:', {
          department,
          directDepartment: staff.department,
          teacherDetailsDepartment: staff.teacherDetails?.department,
          staffObject: staff
        });
        
        return department;
      }
    },    { id: 'email', label: 'Email', sortable: true },
    { 
      id: 'phoneNumber', 
      label: 'Contact', 
      sortable: true,
      format: (_, staff) => {
        // Check both phoneNumber and phone fields as per StaffMember interface
        return staff.phoneNumber || staff.phone || '-';
      }
    },
    { 
      id: 'isActive', 
      label: 'Status', 
      sortable: true,
      format: (_, staff) => {
        const currentStatus = staff.employmentStatus || EmploymentStatus.ACTIVE;
        return (
          hasPermission(user?.role || '', 'MANAGE_STAFF') ? (
            <FormControl size="small" fullWidth>
              <Select
                value={currentStatus}
                onChange={(e) => handleStatusChange(staff, e.target.value as EmploymentStatus)}
                disabled={updateStatusLoading}
                variant="standard"
                sx={{ 
                  '& .MuiSelect-select': { 
                    py: 0, 
                    color: () => {
                      switch (currentStatus) {
                        case EmploymentStatus.ACTIVE:
                          return 'success.main';
                        case EmploymentStatus.LEAVE_OF_ABSENCE:
                        case EmploymentStatus.PROBATION:
                        case EmploymentStatus.CONTRACT:
                          return 'warning.main';
                        case EmploymentStatus.TERMINATED:
                        case EmploymentStatus.RETIRED:
                        case EmploymentStatus.RESIGNED:
                        case EmploymentStatus.INACTIVE:
                          return 'error.main';
                        default:
                          return 'text.primary';
                      }
                    }
                  }
                }}
              >
                {/* Only show valid options based on effective current status */}
                {currentStatus === EmploymentStatus.ACTIVE ? (
                  ALLOWED_EMPLOYMENT_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem key={currentStatus} value={currentStatus}>
                    {currentStatus ? currentStatus.replace('_', ' ') : 'UNKNOWN'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          ) : (
            <Chip 
              label={currentStatus.replace('_', ' ')} 
              color={getStatusColor(currentStatus as EmploymentStatus)}
              size="small"
            />
          )
        );
      }
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
            </>          )}
          
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
        </Box>
      )
    }
  ];

  // Enhanced debug method with structured logging
  useEffect(() => {
    if (staffList) {
      console.log('=== Staff Data Debug ===');
      debugStaffResponse(staffList);
      
      // Check if the data has all the necessary fields and structure
      if (Array.isArray(staffList) && staffList.length > 0) {
        const firstStaff = staffList[0];
        console.log('Detailed staff inspection:');
        inspectObject(firstStaff, 'First Staff Member');
        
        // Check critical fields
        const criticalFields = ['firstName', 'lastName', 'role', 'staffId', 'email'];
        const missingFields = criticalFields.filter(field => !firstStaff[field]);
        
        if (missingFields.length > 0) {
          console.warn('Missing critical fields:', missingFields);
        }
      } else if (Array.isArray(staffList) && staffList.length === 0) {
        console.warn('Staff list is empty. Adding test staff member for debugging:');
        const testStaff = createTestStaffMember();
        console.log(testStaff);
      }
    } else {
      console.warn('staffList is null or undefined');
    }
  }, [staffList]);

  // Enhanced error handling
  useEffect(() => {
    if (error) {
      console.error('Error in Staff component:', error);
      showNotification({
        type: 'error',
        message: `Failed to load staff data: ${error}`,
      });
    }
  }, [error, showNotification]);

  // Add fallback data if staffList is empty but we have a count showing total of 1
  useEffect(() => {
    if (staffList && Array.isArray(staffList) && staffList.length === 0) {
      console.log('staffList is empty array, adding fallback data');
      // Create a fallback staff member to ensure UI works
      const fallbackStaff: StaffMember = {
        id: 0,
        firstName: 'Default',
        lastName: 'Staff',
        email: 'default@example.com',
        role: 'Unknown',
        isActive: true,
        staffId: 'STAFF-0001',
        department: 'Administration'
      };
      
      // This is just for debugging purposes - it won't actually modify the state
      console.log('Would display fallback staff:', [fallbackStaff]);
    }
  }, [staffList]);

  // Direct test function for API troubleshooting
  const testStaffApi = async () => {
    try {
      console.group('Staff API Direct Test');
      console.log('Making direct fetch request to /api/staff...');
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('token');
      
      console.log('Using API URL:', apiUrl);
      console.log('Token available:', !!token);
      
      const response = await fetch(`${apiUrl}/api/staff`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      // Use our debug utility
      debugStaffResponse(responseData);
      
      if (Array.isArray(responseData) && responseData.length > 0) {
        console.log('✅ API returned data successfully!');
      } else if (Array.isArray(responseData) && responseData.length === 0) {
        console.warn('⚠️ API returned an empty array');
      } else {
        console.error('❌ API did not return an array');
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('Error testing staff API:', error);
    }
  };

  if (loading && !staffList) {
    return <Loading />;
  }
  if (error) {
    // Properly handle potential string error by explicitly converting to string
    const errorMessage = typeof error === 'string' 
      ? error 
      : (error as Error)?.message || String(error);
    return <ErrorMessage message={errorMessage} onRetry={refresh} />;
  }

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

      <BulkStaffUploadDialog
        open={bulkUploadDialogOpen}
        onClose={handleBulkUploadDialogClose}
        onSubmit={handleBulkSubmit}
        loading={bulkCreateLoading}
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

      {/* Add Debug Test Button (only in development) */}
      {import.meta.env.DEV && (
        <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            color="warning" 
            size="small"
            onClick={testStaffApi}
            sx={{ 
              borderStyle: 'dashed',
              fontSize: '0.75rem'
            }}
          >
            Debug: Test Staff API Directly
          </Button>
        </Box>
      )}

      <AuthDebugger />
    </Box>
  );
};

export default Staff;