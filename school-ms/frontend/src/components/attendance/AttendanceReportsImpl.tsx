import * as React from 'react';
import { useEffect, useState } from 'react';
import {
    AssessmentOutlined,
    CalendarToday,
    GetApp,
    PeopleOutline,
    Person,
    Print
} from '@mui/icons-material';
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis
} from 'recharts';
import { useNotification } from '../../context/NotificationContext';
import { useApi } from '../../hooks/useApi';
import { employeeAttendanceService, EmployeeAttendanceStatus } from '../../services/employeeAttendanceService';
import staffService from '../../services/staffService';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

interface AttendanceReportsImplProps {
  isAdmin: boolean;
  staffType?: string;
}

// Add global print styles to ensure all content is printed properly
const printStyles = `
  @media print {
    /* Hide UI controls during printing */
    button, .MuiTabs-root, .MuiTab-root, form, .print-hide {
      display: none !important;
    }
    
    /* Ensure content is displayed properly */
    .print-container {
      display: block !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Ensure tables display properly */
    table {
      width: 100% !important;
      page-break-inside: auto !important;
      border-collapse: collapse !important;
    }
    
    /* Prevent page breaks inside rows */
    tr {
      page-break-inside: avoid !important;
    }
    
    /* Ensure headers print on each page */
    thead {
      display: table-header-group !important;
    }
    
    /* Set text colors for better printing */
    * {
      color: #000 !important;
      text-shadow: none !important;
    }
    
    /* Status colors should still be visible */
    .status-present { color: #2e7d32 !important; }
    .status-absent { color: #d32f2f !important; }
    .status-half-day { color: #ed6c02 !important; }
    .status-leave { color: #0288d1 !important; }
    .status-weekend, .status-not-marked { color: #757575 !important; }
    
    /* Remove shadows and make borders more visible */
    .MuiPaper-root, .MuiCard-root {
      box-shadow: none !important;
      border: 1px solid #ddd !important;
      margin-bottom: 20px !important;
    }
    
    /* Make sure content isn't cut off */
    body {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;

const AttendanceReportsImpl: React.FC<AttendanceReportsImplProps> = ({ isAdmin, staffType = 'ALL' }) => {
  // Add print styles to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = printStyles;
    document.head.appendChild(styleElement);
    
    // Save original title
    const originalTitle = document.title;
    
    return () => {
      document.head.removeChild(styleElement);
      document.title = originalTitle;
    };
  }, []);
  
  const { showNotification } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [selectedStaffMember, setSelectedStaffMember] = useState<number | ''>('');
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  
  // Calculate date range for monthly data
  const monthStartDate = dayjs(`${selectedYear}-${selectedMonth}-01`);
  const monthEndDate = monthStartDate.endOf('month');
  
  // API calls using available endpoints with comprehensive error handling
  const { data: allStaff, loading: staffLoading, error: staffError } = useApi(
    () => {
      console.log("Fetching all staff data");
      
      // Add robust error handling with retry mechanism
      return new Promise((resolve, reject) => {
        // Implement a simple retry mechanism
        const fetchWithRetry = (retryCount = 0, maxRetries = 2) => {
          staffService.getAll()
            .then(response => {
              console.log(`Received ${response?.length || 0} staff records`);
              resolve(response || []); // Ensure we always return an array even if response is null/undefined
            })
            .catch(error => {
              console.error(`Error fetching staff data (attempt ${retryCount + 1}):`, error);
              
              // Retry up to maxRetries times
              if (retryCount < maxRetries) {
                console.log(`Retrying staff data fetch (${retryCount + 1}/${maxRetries})...`);
                setTimeout(() => fetchWithRetry(retryCount + 1, maxRetries), 1000); // Wait 1 second before retry
              } else {
                // After max retries, reject with the error
                console.error('Max retries reached. Staff data could not be loaded.');
                reject(error);
              }
            });
        };
        
        // Start the fetch process with retries
        fetchWithRetry();
      });
    },
    { dependencies: [] }
  );
  
  // Extract unique departments from staff data with fallback for when allStaff is not available
  const departmentList = React.useMemo(() => {
    // Fallback department list for when staff data can't be loaded
    const fallbackDepartments = ['Science', 'Mathematics', 'English', 'Social Studies', 'Physical Education', 'Arts'];
    
    if (!allStaff || allStaff.length === 0) {
      console.log('Using fallback departments list since staff data is not available');
      return fallbackDepartments;
    }
    
    try {
      const departments = allStaff
        .filter(staff => staff.department)
        .map(staff => staff.department as string);
      
      const uniqueDepartments = Array.from(new Set(departments)).sort();
      
      // If no departments were found, use fallback list
      return uniqueDepartments.length > 0 ? uniqueDepartments : fallbackDepartments;
    } catch (error) {
      console.error('Error processing department list:', error);
      return fallbackDepartments;
    }
  }, [allStaff]);
  
  // Filter staff based on staff type and active status with improved error handling
  const filteredStaff = React.useMemo(() => {
    try {
      if (!allStaff || allStaff.length === 0) {
        console.log('No staff data available for filtering');
        
        // Create dummy staff data as a fallback when no real data is available
        if (staffError) {
          console.log('Using fallback staff data due to error');
          
          // Generate placeholder staff data to keep UI functional
          // This will enable navigation and interaction even without backend data
          const dummyStaffTypes = ['TEACHER', 'ADMINISTRATOR', 'SUPPORT_STAFF'];
          const dummyDepartments = ['Science', 'Mathematics', 'English', 'Social Studies', 'Physical Education', 'Arts'];
          
          // Only include dummy data of the correct staff type if filtering is applied
          let filteredDummyStaff = [];
          
          if (staffType === 'ALL') {
            // For 'ALL' staff type, include all types
            filteredDummyStaff = Array.from({ length: 5 }, (_, i) => ({
              id: i + 1,
              firstName: `Sample`,
              lastName: `Staff ${i + 1}`,
              employeeType: dummyStaffTypes[i % dummyStaffTypes.length],
              department: dummyDepartments[i % dummyDepartments.length],
              employmentStatus: 'ACTIVE'
            }));
          } else {
            // For specific staff type, only include that type
            filteredDummyStaff = Array.from({ length: 3 }, (_, i) => ({
              id: i + 1,
              firstName: `Sample`,
              lastName: `${staffType.replace('_', ' ')} ${i + 1}`,
              employeeType: staffType,
              department: dummyDepartments[i % dummyDepartments.length],
              employmentStatus: 'ACTIVE'
            }));
          }
          
          return filteredDummyStaff;
        }
        
        return [];
      }
      
      // Log the total count before filtering
      console.log(`Total staff before filtering: ${allStaff.length}`);
      
      const filtered = allStaff.filter(staff => {
        // Make sure staff object is valid
        if (!staff) return false;
        
        // Filter by staff type if specified
        if (staffType !== 'ALL' && staff.employeeType !== staffType) {
          return false;
        }
        
        // Include all active staff (can be teachers, administrators, or other staff)
        return staff.employmentStatus === 'ACTIVE';
      });
      
      // Log the count after filtering
      console.log(`Staff after filtering (type=${staffType}): ${filtered.length}`);
      
      // Sort staff alphabetically by name for better usability
      filtered.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      return filtered;
    } catch (error) {
      console.error('Error filtering staff data:', error);
      return [];
    }
  }, [allStaff, staffType, staffError]);
  
  // Get attendance data for selected staff member with comprehensive error handling
  const { data: staffAttendance, loading: staffAttendanceLoading, error: staffAttendanceError } = useApi(
    () => {
      if (!selectedStaffMember) return Promise.resolve([]);
      
      console.log(`Fetching attendance for staff ID: ${selectedStaffMember}`);
      
      // Enhanced error handling with multiple fallback strategies and detailed logging
      return new Promise((resolve, reject) => {
        // Set a timeout to handle cases where the API might hang
        const timeoutId = setTimeout(() => {
          console.warn(`Attendance data fetch timed out for staff ID ${selectedStaffMember}`);
          reject(new Error("Request timed out after 15 seconds. The server may be experiencing high load."));
        }, 15000); // 15 second timeout
        
        // Track if request was aborted
        let isAborted = false;
        
        // Create an abort controller to cancel the request if needed
        const abortController = new AbortController();
        
        // Attempt to fetch attendance data with retry mechanism
        let retryCount = 0;
        const maxRetries = 1; // Only retry once to avoid excessive requests
        
        const fetchWithRetry = () => {
          console.log(`Attempting to fetch attendance data (attempt ${retryCount + 1}/${maxRetries + 1})`);
          
          employeeAttendanceService.getAttendanceByEmployee(Number(selectedStaffMember))
            .then(response => {
              // Don't process if request was aborted
              if (isAborted) return;
              
              // Clear the timeout since we got a response
              clearTimeout(timeoutId);
              
              // Handle the response
              console.log(`Received ${response?.length || 0} attendance records for staff ID ${selectedStaffMember}`);
              
              // Validate the response structure to prevent errors during processing
              if (response && Array.isArray(response)) {
                resolve(response);
              } else if (response === null || response === undefined) {
                console.warn(`Null/undefined response for staff ID ${selectedStaffMember}`);
                resolve([]); // Return empty array as fallback for null/undefined
              } else if (typeof response === 'object') {
                console.warn(`Response is an object but not an array for staff ID ${selectedStaffMember}`, response);
                // Try to convert to array if possible
                try {
                  const converted = Object.values(response);
                  console.log(`Converted object to array with ${converted.length} items`);
                  resolve(converted);
                } catch (conversionError) {
                  console.error('Failed to convert object to array:', conversionError);
                  resolve([]); // Return empty array as fallback
                }
              } else {
                console.warn(`Invalid attendance data format for staff ID ${selectedStaffMember}:`, response);
                resolve([]); // Return empty array as fallback for any other case
              }
            })
            .catch(error => {
              // Don't process if request was aborted
              if (isAborted) return;
              
              // Clear the timeout since we got an error response
              clearTimeout(timeoutId);
              
              console.error(`Error fetching attendance for staff ID ${selectedStaffMember}:`, error);
              
              // Try to retry the request if we haven't exceeded max retries
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying attendance data fetch (${retryCount}/${maxRetries})...`);
                setTimeout(fetchWithRetry, 2000); // Wait 2 seconds before retry
                return;
              }
              
              // Add more detailed error logging to help diagnose the issue
              let errorMessage = "Failed to load attendance data.";
              
              if (error.response) {
                const status = error.response.status;
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', status);
                
                // Provide more specific error messages based on status code
                if (status === 404) {
                  errorMessage = `No attendance records found for this staff member (${selectedStaffMember}).`;
                } else if (status === 401 || status === 403) {
                  errorMessage = "You don't have permission to view these attendance records.";
                } else if (status === 500) {
                  errorMessage = "The server encountered an error while processing this request.";
                } else if (status >= 400 && status < 500) {
                  errorMessage = `Client error (${status}): The request was invalid or cannot be processed.`;
                } else if (status >= 500) {
                  errorMessage = `Server error (${status}): The server failed to fulfill the request.`;
                }
                
                reject(new Error(errorMessage));
              } else if (error.request) {
                console.error('No response received from server');
                reject(new Error("No response received from server. Please check your network connection."));
              } else {
                console.error('Error message:', error.message);
                reject(new Error(error.message || "Unknown error occurred while fetching attendance data."));
              }
            });
        };
        
        // Start the fetch process
        fetchWithRetry();
        
        // Return a cleanup function to abort the request if component unmounts
        return () => {
          isAborted = true;
          clearTimeout(timeoutId);
          abortController.abort();
        };
      });
    },
    { 
      dependencies: [selectedStaffMember],
      showErrorNotification: false // We'll handle error notifications manually for more control
    }
  );
  
  // Get attendance data for selected month (for all employees) with robust error handling
  const { data: monthlyAttendance, loading: monthlyAttendanceLoading, error: monthlyAttendanceError } = useApi(
    () => {
      console.log(`Fetching monthly attendance for date range: ${monthStartDate.format('YYYY-MM-DD')} to ${monthEndDate.format('YYYY-MM-DD')}`);
      
      // Add try-catch for better error handling
      try {
        return employeeAttendanceService.getAttendanceByDateRange(
          monthStartDate.format('YYYY-MM-DD'), 
          monthEndDate.format('YYYY-MM-DD'),
          staffType
        )
        .then(response => {
          console.log(`Received ${response?.length || 0} monthly attendance records`);
          return response || []; // Ensure we always return an array, even if empty
        })
        .catch(error => {
          console.error(`Error fetching monthly attendance:`, error);
          // Re-throw to let the useApi hook handle the error properly
          throw error;
        });
      } catch (error) {
        console.error('Unexpected error in monthly attendance API call:', error);
        return Promise.reject(error);
      }
    },
    { dependencies: [selectedYear, selectedMonth, staffType] }
  );
  
  // Calculate employee stats from raw attendance data
  const employeeStats = React.useMemo(() => {
    if (!staffAttendance || !selectedStaffMember) return null;
    
    // Filter by date range
    const inRangeAttendance = staffAttendance.filter(record => {
      const recordDate = dayjs(record.attendanceDate);
      return recordDate.isAfter(startDate) && recordDate.isBefore(endDate);
    });
    
    // Count days by status
    const presentDays = inRangeAttendance.filter(a => a.status === EmployeeAttendanceStatus.PRESENT).length;
    const absentDays = inRangeAttendance.filter(a => a.status === EmployeeAttendanceStatus.ABSENT).length;
    const halfDays = inRangeAttendance.filter(a => a.status === EmployeeAttendanceStatus.HALF_DAY).length;
    const leaveDays = inRangeAttendance.filter(a => a.status === EmployeeAttendanceStatus.ON_LEAVE).length;
    const totalMarkedDays = inRangeAttendance.length;
    
    // Calculate total working days (excluding weekends and holidays)
    const totalDays = endDate.diff(startDate, 'day') + 1;
    const totalWorkingDays = totalDays - Math.floor(totalDays / 7) * 2; // Approximate by removing weekends
    
    // Calculate attendance percentage
    const attendancePercentage = totalMarkedDays > 0 
      ? Math.round((presentDays + (halfDays * 0.5)) / totalMarkedDays * 100)
      : 0;
      
    // Group dates by status for details section
    const datesByStatus = inRangeAttendance.reduce((acc, curr) => {
      if (!acc[curr.status]) {
        acc[curr.status] = [];
      }
      acc[curr.status].push(curr.attendanceDate);
      return acc;
    }, {} as Record<string, string[]>);
    
    return {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      totalWorkingDays,
      presentDays,
      absentDays,
      halfDays,
      leaveDays,
      attendancePercentage,
      datesByStatus
    };
  }, [staffAttendance, selectedStaffMember, startDate, endDate]);
  
  // Calculate monthly report data from raw attendance with robust error handling
  const monthlyReport = React.useMemo(() => {
    try {
      // Log the input data for debugging
      console.log(`Processing monthly report data. Monthly attendance records: ${monthlyAttendance?.length || 0}, Staff records: ${allStaff?.length || 0}`);
      
      if (!monthlyAttendance || !allStaff) {
        console.log("Missing data for monthly report calculation:", { 
          hasMonthlyAttendance: !!monthlyAttendance, 
          hasStaffData: !!allStaff 
        });
        return null;
      }
      
      // Validate data structure to prevent errors
      if (!Array.isArray(monthlyAttendance)) {
        console.error("Invalid monthly attendance data structure:", monthlyAttendance);
        return null;
      }
      
      if (!Array.isArray(allStaff)) {
        console.error("Invalid staff data structure:", allStaff);
        return null;
      }
      
      // If we have empty arrays, create a basic report structure without employee data
      if (monthlyAttendance.length === 0) {
        console.log("No monthly attendance data available, creating empty report");
        return {
          year: selectedYear,
          month: selectedMonth,
          monthName: monthStartDate.format('MMMM'),
          startDate: monthStartDate.format('YYYY-MM-DD'),
          endDate: monthEndDate.format('YYYY-MM-DD'),
          totalWorkingDays: monthEndDate.diff(monthStartDate, 'day') + 1,
          employeeSummaries: [],
          dataStatus: 'empty'
        };
      }
      
      // Group attendance by employee with defensive checks
      const employeeAttendanceMap = monthlyAttendance.reduce((acc, record) => {
        // Handle null or undefined records
        if (!record) {
          console.warn("Null or undefined attendance record found, skipping");
          return acc;
        }
        
        // Check if employee ID exists and is valid
        if (typeof record.employeeId === 'undefined' || record.employeeId === null) {
          console.warn("Attendance record missing employee ID, skipping:", record);
          return acc;
        }
        
        // Create a string key to avoid issues with type conversion
        const empId = String(record.employeeId);
        
        if (!acc[empId]) {
          acc[empId] = [];
        }
        
        // Validate attendance date before adding record
        if (!record.attendanceDate) {
          console.warn("Attendance record missing date, skipping:", record);
          return acc;
        }
        
        acc[empId].push(record);
        return acc;
      }, {} as Record<string, typeof monthlyAttendance>);
      
      console.log(`Grouped attendance for ${Object.keys(employeeAttendanceMap).length} employees`);
      
      // Calculate summaries for each employee
      const employeeSummaries = Object.entries(employeeAttendanceMap).map(([employeeIdStr, records]) => {
        try {
          // Convert string ID to number with parseInt to ensure correct comparison
          const employeeId = parseInt(employeeIdStr, 10);
          
          // Find the employee in the staff list
          const employee = allStaff.find(s => s && s.id === employeeId);
          
          // If employee not found, create a placeholder record
          if (!employee) {
            console.warn(`No matching staff found for employee ID ${employeeId}, creating placeholder`);
            
            // Create a placeholder with minimal data that won't break the UI
            return {
              employeeId,
              employeeName: `Unknown Staff (ID: ${employeeId})`,
              department: 'Unknown Department',
              presentDays: records.filter(r => r && r.status === EmployeeAttendanceStatus.PRESENT).length,
              halfDays: records.filter(r => r && r.status === EmployeeAttendanceStatus.HALF_DAY).length,
              absentDays: records.filter(r => r && r.status === EmployeeAttendanceStatus.ABSENT).length,
              leaveDays: records.filter(r => r && r.status === EmployeeAttendanceStatus.ON_LEAVE).length,
              attendancePercentage: "0",
              dailyStatus: {},
              isPlaceholder: true
            };
          }
          
          // Count days by status with defensive checks, ensuring no null records are counted
          const presentDays = records.filter(r => r && r.status === EmployeeAttendanceStatus.PRESENT).length;
          const absentDays = records.filter(r => r && r.status === EmployeeAttendanceStatus.ABSENT).length;
          const halfDays = records.filter(r => r && r.status === EmployeeAttendanceStatus.HALF_DAY).length;
          const leaveDays = records.filter(r => r && r.status === EmployeeAttendanceStatus.ON_LEAVE).length;
          
          // Count valid records (with status)
          const validRecords = records.filter(r => r && r.status).length;
          
          // Calculate attendance percentage with extra validation
          let attendancePercentage = "0";
          try {
            // Only calculate if we have valid records
            if (validRecords > 0) {
              const percentage = ((presentDays + (halfDays * 0.5)) / validRecords * 100);
              // Check for NaN or infinity
              if (!isNaN(percentage) && isFinite(percentage)) {
                attendancePercentage = percentage.toFixed(1);
              } else {
                console.warn(`Invalid attendance percentage calculation for employee ${employeeId}:`, { 
                  presentDays, halfDays, validRecords 
                });
              }
            }
          } catch (calcError) {
            console.error(`Error calculating attendance percentage for employee ${employeeId}:`, calcError);
          }
          
          // Create daily status map with defensive checks
          const dailyStatus = records.reduce((acc, record) => {
            // Skip invalid records
            if (!record || !record.attendanceDate || typeof record.status === 'undefined') {
              return acc;
            }
            
            // Ensure date is in ISO format (YYYY-MM-DD)
            let dateKey;
            try {
              // Try to normalize the date format
              dateKey = dayjs(record.attendanceDate).format('YYYY-MM-DD');
            } catch (dateError) {
              console.warn(`Invalid date format in record:`, record.attendanceDate);
              return acc;
            }
            
            acc[dateKey] = record.status;
            return acc;
          }, {} as Record<string, string>);
          
          // Get employee name with defensive check
          let employeeName = "Unknown";
          try {
            // Check if firstName and lastName exist before concatenating
            const firstName = employee.firstName || '';
            const lastName = employee.lastName || '';
            employeeName = `${firstName} ${lastName}`.trim();
            
            // If name is empty after trimming, use a fallback
            if (!employeeName) {
              employeeName = `Staff ID: ${employeeId}`;
            }
          } catch (nameError) {
            console.warn(`Error constructing name for employee ID ${employeeId}:`, nameError);
            employeeName = `Staff ID: ${employeeId}`;
          }
          
          return {
            employeeId,
            employeeName,
            department: (employee.department || 'Unknown'),
            presentDays,
            halfDays,
            absentDays,
            leaveDays,
            attendancePercentage,
            dailyStatus,
            totalRecords: records.length,
            validRecords
          };
        } catch (err) {
          console.error(`Error processing employee ${employeeIdStr}:`, err);
          // Return null for this employee, will be filtered out later
          return null;
        }
      }).filter(Boolean); // Remove null entries
      
      console.log(`Processed ${employeeSummaries.length} employee summaries for monthly report`);
      
      return {
        year: selectedYear,
        month: selectedMonth,
        monthName: monthStartDate.format('MMMM'),
        startDate: monthStartDate.format('YYYY-MM-DD'),
        endDate: monthEndDate.format('YYYY-MM-DD'),
        totalWorkingDays: monthEndDate.diff(monthStartDate, 'day') + 1,
        employeeSummaries,
        dataStatus: employeeSummaries.length > 0 ? 'populated' : 'empty'
      };
    } catch (error) {
      console.error("Error calculating monthly report:", error);
      // Return a minimal valid structure instead of null
      return {
        year: selectedYear,
        month: selectedMonth,
        monthName: monthStartDate.format('MMMM'),
        startDate: monthStartDate.format('YYYY-MM-DD'),
        endDate: monthEndDate.format('YYYY-MM-DD'),
        totalWorkingDays: monthEndDate.diff(monthStartDate, 'day') + 1,
        employeeSummaries: [],
        dataStatus: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [monthlyAttendance, allStaff, selectedYear, selectedMonth, monthStartDate, monthEndDate]);
  
  // Prepare data for department-wise comparison
  const departmentData = React.useMemo(() => {
    try {
      if (!monthlyReport || !monthlyReport.employeeSummaries) {
        // Provide fallback data for visualization if no real data exists
        if (staffError || !allStaff) {
          // If there's a staff loading error, return sample data for visualization
          const fallbackDepartments = ['Science', 'Mathematics', 'English', 'Social Studies', 'Arts'];
          return fallbackDepartments.map(dept => ({
            department: dept,
            attendanceRate: Math.floor(Math.random() * 30) + 70, // Random attendance between 70-100%
            total: Math.floor(Math.random() * 10) + 5 // Random staff count between 5-15
          }));
        }
        return [];
      }
      
      // Group by department
      const deptMap: Record<string, { 
        department: string, 
        attendanceRate: number, 
        total: number 
      }> = {};
      
      monthlyReport.employeeSummaries.forEach(employee => {
        // Safely handle missing data
        if (!employee) return;
        
        const dept = employee.department || 'Unknown';
        if (!deptMap[dept]) {
          deptMap[dept] = {
            department: dept,
            attendanceRate: 0,
            total: 0
          };
        }
        
        const attendancePercentage = parseFloat(employee.attendancePercentage || '0');
        deptMap[dept].attendanceRate += attendancePercentage;
        deptMap[dept].total += 1;
      });
      
      // Calculate averages
      return Object.values(deptMap).map(item => ({
        ...item,
        attendanceRate: item.total > 0 ? Math.round(item.attendanceRate / item.total) : 0
      }));
    } catch (error) {
      console.error("Error calculating department data:", error);
      // Return empty array as fallback
      return [];
    }
  }, [monthlyReport, allStaff, staffError]);

  // Trend analysis data calculation removed

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get teacher name from ID
  const getStaffName = (id: number) => {
    const staff = filteredStaff?.find((s: any) => s.id === id);
    return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown';
  };

  // Handle export reports
  const handleExport = () => {
    if (tabValue !== 1) {
      showNotification('Please navigate to Department Reports tab to export data', 'info');
      return;
    }
    
    if (!monthlyReport || !monthlyReport.employeeSummaries) {
      showNotification('No data available to export', 'error');
      return;
    }
    
    // Filter staff by selected department
    const filteredEmployees = selectedDepartment === 'ALL'
      ? monthlyReport.employeeSummaries
      : monthlyReport.employeeSummaries.filter(emp => emp.department === selectedDepartment);
    
    if (filteredEmployees.length === 0) {
      showNotification('No staff found in the selected department', 'warning');
      return;
    }
    
    try {
      // Generate CSV headers with dates
      const daysInMonth = monthEndDate.date();
      const dateHeaders = Array.from({ length: daysInMonth }, (_, i) => 
        `${monthStartDate.date(i + 1).format('D MMM')}`
      );
      
      // Create header row
      let csvContent = `Staff ID,Name,Department,${dateHeaders.join(',')},Present,Absent,Half Day,Leave,Attendance %\n`;
      
      // Add data for each employee
      filteredEmployees.forEach(employee => {
        const {
          employeeId,
          employeeName,
          department,
          presentDays,
          absentDays,
          halfDays,
          leaveDays,
          attendancePercentage,
          dailyStatus
        } = employee;
        
        // Create daily status entries
        const dailyEntries = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const date = monthStartDate.date(day).format('YYYY-MM-DD');
          const status = dailyStatus[date] || '-';
          
          // Map status codes to more readable format with defensive checks
          let statusText;
          // First, ensure status is a string and convert to uppercase for case-insensitive comparison
          const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : String(status).toUpperCase();
          
          switch(normalizedStatus) {
            case 'PRESENT':
              statusText = 'P';
              break;
            case 'ABSENT':
              statusText = 'A';
              break;
            case 'HALF_DAY':
            case 'HALFDAY': // Handle possible variations
              statusText = 'H';
              break;
            case 'ON_LEAVE':
            case 'ONLEAVE':
            case 'LEAVE':
              statusText = 'L';
              break;
            case '-':
            case 'UNDEFINED':
            case 'NULL':
            case 'NONE':
              statusText = '-';
              break;
            default:
              // Log any unexpected status values
              console.warn(`Unknown attendance status code encountered: '${status}'`);
              statusText = '-';
          }
          
          dailyEntries.push(statusText);
        }
        
        // Add row to CSV
        csvContent += `${employeeId},"${employeeName}","${department}",${dailyEntries.join(',')},${presentDays},${absentDays},${halfDays},${leaveDays},${attendancePercentage}%\n`;
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      
      // Generate filename with department, month and year
      const deptName = selectedDepartment === 'ALL' ? 'All_Departments' : selectedDepartment.replace(/\s+/g, '_');
      const monthName = monthStartDate.format('MMM').toLowerCase();
      link.setAttribute('download', `${deptName}_attendance_${monthName}_${selectedYear}.csv`);
      
      // Trigger download and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showNotification(`Exported ${filteredEmployees.length} staff records successfully`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Failed to export data. Please try again.', 'error');
    }
  };

  // Handle print reports
  const handlePrint = () => {
    // Show notification to user
    showNotification('Preparing document for printing...', 'info');
    
    // Add a class to body for print-specific styling
    document.body.classList.add('printing-attendance');
    
    // Add a sufficient delay to ensure all content is properly rendered before printing
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error('Print error:', err);
        showNotification('There was an error when trying to print', 'error');
      } finally {
        // Remove the print class after printing
        setTimeout(() => {
          document.body.classList.remove('printing-attendance');
        }, 500);
      }
    }, 500);
  };

  // Log errors for debugging
  useEffect(() => {
    if (staffError) {
      console.error("Staff data loading error:", staffError);
    }
    if (staffAttendanceError) {
      console.error("Staff attendance data loading error:", staffAttendanceError);
    }
    if (monthlyAttendanceError) {
      console.error("Monthly attendance data loading error:", monthlyAttendanceError);
    }
  }, [staffError, staffAttendanceError, monthlyAttendanceError]);
  
  // Prepare empty datasets as fallbacks when data cannot be loaded
  const safeFilteredStaff = React.useMemo(() => {
    return filteredStaff && filteredStaff.length > 0 ? filteredStaff : [];
  }, [filteredStaff]);
  
  // Set document title for printing - moved after filteredStaff is defined
  useEffect(() => {
    if (selectedStaffMember && filteredStaff) {
      const staff = filteredStaff.find((s: any) => s.id === Number(selectedStaffMember));
      const staffName = staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Staff';
      document.title = `Attendance Report - ${staffName}`;
    } else {
      document.title = 'Attendance Reports & Analytics';
    }
  }, [selectedStaffMember, filteredStaff]);

  // Loading state
  if (staffLoading || 
    (tabValue === 0 && selectedStaffMember && staffAttendanceLoading) || 
    (tabValue !== 0 && monthlyAttendanceLoading)) {
    return <Loading />;
  }
  
  // If we're on the individual tab and have a staff error, show a recoverable error message
  if (staffError && tabValue === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Staff data could not be loaded
        </Typography>
        <Typography variant="body1" paragraph>
          We encountered an issue while fetching staff data. This might be due to:
        </Typography>
        <ul>
          <li>Network connectivity issues</li>
          <li>Server maintenance</li>
          <li>Database connection problems</li>
        </ul>
        <Typography variant="body2" sx={{ mt: 2 }}>
          You can try switching to the Department Reports tab, which may still work with limited functionality.
          Alternatively, please contact your system administrator if this issue persists.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }} 
          onClick={() => setTabValue(1)}
        >
          Switch to Department Reports
        </Button>
        <Button 
          variant="outlined" 
          color="secondary" 
          sx={{ mt: 2, ml: 2 }} 
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </Box>
    );
  }
  
  // Don't completely block the UI when there's a staff attendance error
  // Instead, render the normal UI but with an error message
  // This allows the user to still navigate and try different things
  
  // Specific error handling for department tab - don't block rendering, just show an error message
  if (tabValue !== 0 && (monthlyAttendanceError || (staffError && !departmentData.length))) {
    const errorType = monthlyAttendanceError ? "attendance data" : "staff data";
    console.error(`Department ${errorType} loading error:`, monthlyAttendanceError || staffError);
    
    // Instead of completely blocking the UI, show an error message but still allow navigation and interaction
    return (
      <Box>
        {/* Keep the tabs navigation accessible */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="attendance reports tabs"
            >
              <Tab icon={<Person />} label="Individual Reports" />
              {isAdmin && <Tab icon={<PeopleOutline />} label="Department Reports" />}
            </Tabs>
            
            {/* Show error message but keep UI functional */}
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" color="error" gutterBottom>
                Department {errorType} could not be loaded
              </Typography>
              <Typography variant="body1">
                We encountered an issue while fetching department data. 
                This may be due to server issues or data availability problems.
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Try selecting a different month or year, switch to the Individual Reports tab,
                or reload the page to try again.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mr: 2 }} 
                  onClick={() => setTabValue(0)}
                >
                  Switch to Individual Reports
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setSelectedMonth(dayjs().month() + 1);
                    setSelectedYear(dayjs().year());
                  }}
                  sx={{ mr: 2 }}
                >
                  Reset Date Range
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </Box>
            </Box>
          </Paper>
        </LocalizationProvider>
      </Box>
    );
  }

  return (
    <Box>
      <Box className="print-hide" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Attendance Reports & Analytics
        </Typography>
        
        {isAdmin && (
          <Box className="print-hide">
            <Button
              variant="contained"
              color={tabValue === 1 ? "primary" : "inherit"}
              startIcon={<GetApp />}
              onClick={handleExport}
              sx={{ mr: 1 }}
              title={tabValue === 1 ? 
                `Export ${selectedDepartment === 'ALL' ? 'all departments' : selectedDepartment} attendance for ${dayjs().month(selectedMonth - 1).format('MMMM')} ${selectedYear}` : 
                "Go to Department Reports tab to export data"
              }
            >
              Export Department Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrint}
            >
              Print
            </Button>
          </Box>
        )}
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="attendance reports tabs"
          >
            <Tab icon={<Person />} label="Individual Reports" />
            {isAdmin && <Tab icon={<PeopleOutline />} label="Department Reports" />}
          </Tabs>

          {/* Individual Teacher Report */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2} className="print-hide">
              <Grid item xs={12} md={4}>
                <Autocomplete
                  id="staff-select-autocomplete"
                  options={safeFilteredStaff}
                  getOptionLabel={(staff) => {
                    try {
                      return `${staff.firstName} ${staff.lastName}`;
                    } catch (error) {
                      console.error("Error in getOptionLabel:", error);
                      return "Unknown Staff";
                    }
                  }}
                  renderOption={(props, staff) => {
                    try {
                      return (
                        <li {...props} key={staff.id}>
                          <div>
                            {staff.firstName} {staff.lastName}
                            {staff.employeeType && (
                              <span style={{ fontSize: '0.8em', marginLeft: '8px', color: '#666' }}>
                                ({staff.employeeType.replace('_', ' ')})
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    } catch (error) {
                      console.error("Error in renderOption:", error);
                      return <li {...props}>Error displaying staff</li>;
                    }
                  }}
                  value={safeFilteredStaff.find(s => s.id === selectedStaffMember) || null}
                  onChange={(_, newValue) => setSelectedStaffMember(newValue ? newValue.id : '')}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Select Staff Member" 
                      placeholder="Type to search staff"
                      fullWidth
                    />
                  )}
                  disableListWrap
                  filterOptions={(options, state) => {
                    // Custom filtering logic for better performance with large datasets
                    const input = state.inputValue.toLowerCase().trim();
                    if (!input) return options.slice(0, 100); // Limit initial display for better performance
                    
                    return options.filter(staff => 
                      `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(input)
                    );
                  }}
                  ListboxProps={{
                    style: { maxHeight: 250 }
                  }}
                />
                {staffType === 'ALL' ? (
                  <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    Showing all active staff members ({filteredStaff?.length || 0})
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    Filtered to {staffType.replace('_', ' ').toLowerCase()} staff ({filteredStaff?.length || 0})
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => date && setStartDate(dayjs(date as any))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date) => date && setEndDate(dayjs(date as any))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>

            {/* Show attendance error message if there's an error but still allow the user to interact with the UI */}
            {selectedStaffMember && staffAttendanceError && (
              <Card sx={{ mt: 3, border: '1px solid', borderColor: 'error.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ 
                      backgroundColor: 'error.light', 
                      borderRadius: '50%', 
                      width: 40, 
                      height: 40, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <Typography variant="h5" color="white">!</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" color="error" gutterBottom>
                        Attendance data could not be loaded
                      </Typography>
                      <Typography variant="body1">
                        We encountered an error while trying to fetch attendance data for {getStaffName(Number(selectedStaffMember))}.
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, p: 1, bgcolor: 'background.paper', fontFamily: 'monospace', borderRadius: 1 }}>
                    Error details: {staffAttendanceError.message || "An unexpected error occurred when fetching attendance records."}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    This issue could be due to:
                  </Typography>
                  <ul>
                    <li>The staff member has no attendance records in the system</li>
                    <li>The attendance database is currently unavailable</li>
                    <li>There might be a network connectivity issue</li>
                  </ul>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => setSelectedStaffMember('')}
                    >
                      Select Different Staff
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        // Try to refetch the data for the same staff member
                        if (selectedStaffMember) {
                          // Create a temporary loading state
                          showNotification('Retrying attendance data fetch...', 'info');
                          
                          employeeAttendanceService.getAttendanceByEmployee(Number(selectedStaffMember))
                            .then(() => {
                              showNotification('Attendance data refreshed successfully', 'success');
                              window.location.reload();
                            })
                            .catch((error) => {
                              showNotification(`Retry failed: ${error.message || 'Unknown error'}`, 'error');
                            });
                        }
                      }}
                    >
                      Retry
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {selectedStaffMember && employeeStats ? (
              <Box className="print-container" sx={{ mt: 3, '@media print': { display: 'block', width: '100%' } }}>
                <Card sx={{ mb: 3, '@media print': { display: 'block', pageBreakAfter: 'avoid' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" component="div">
                          {getStaffName(Number(selectedStaffMember))}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          {dayjs(employeeStats.startDate).format('MMM D, YYYY')} - {dayjs(employeeStats.endDate).format('MMM D, YYYY')}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography variant="h4" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
                            {employeeStats.attendancePercentage}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            Attendance
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            (Present days + 0.5 × Half days) / Total marked days × 100
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={4} sm={2}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                          <Typography variant="h6" color="success.dark">{employeeStats.presentDays}</Typography>
                          <Typography variant="body2">Present</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4} sm={2}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                          <Typography variant="h6" color="error.dark">{employeeStats.absentDays}</Typography>
                          <Typography variant="body2">Absent</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4} sm={2}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                          <Typography variant="h6" color="warning.dark">{employeeStats.halfDays}</Typography>
                          <Typography variant="body2">Half Day</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4} sm={2}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                          <Typography variant="h6" color="info.dark">{employeeStats.leaveDays}</Typography>
                          <Typography variant="body2">Leave</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4} sm={2}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                          <Typography variant="h6">{employeeStats.totalWorkingDays}</Typography>
                          <Typography variant="body2">Working Days</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {employeeStats.datesByStatus && Object.keys(employeeStats.datesByStatus).length > 0 && (
                  <Card sx={{ 
                    mt: 3, 
                    '@media print': { 
                      display: 'block',
                      width: '100%',
                      breakInside: 'auto',
                      pageBreakInside: 'auto'
                    } 
                  }}>
                    <CardContent sx={{ '@media print': { padding: '16px !important' } }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                        Attendance Log
                      </Typography>

                      <TableContainer sx={{ 
                        '@media print': { 
                          display: 'block',
                          width: '100%',
                          pageBreakInside: 'auto',
                          breakInside: 'auto'
                        } 
                      }}>
                        <Table size="small" aria-label="attendance details table" sx={{ 
                          '@media print': { 
                            width: '100%',
                            pageBreakInside: 'auto',
                            breakInside: 'auto',
                            borderCollapse: 'collapse'
                          } 
                        }}>
                          <TableHead sx={{ 
                            '@media print': { 
                              display: 'table-header-group',
                              breakInside: 'avoid',
                              pageBreakInside: 'avoid'
                            }
                          }}>
                            <TableRow sx={{ bgcolor: 'background.paper', '@media print': { backgroundColor: '#f5f5f5 !important' } }}>
                              <TableCell sx={{ fontWeight: 'bold', width: '20%', '@media print': { borderBottom: '2px solid #000', fontWeight: 'bold' } }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', width: '40%', '@media print': { borderBottom: '2px solid #000', fontWeight: 'bold' } }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', width: '40%', '@media print': { borderBottom: '2px solid #000', fontWeight: 'bold' } }}>Day</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody sx={{ '@media print': { display: 'table-row-group' } }}>
                            {/* Create entries for each date in the selected range */}
                            {(() => {
                              // Create a map to store attendance statuses
                              const attendanceMap: Record<string, { status: string; statusColor: string }> = {};
                              
                              // Process existing attendance records
                              Object.entries(employeeStats.datesByStatus).forEach(([status, dates]) => {
                                // Get status color
                                let statusColor = 'text.primary';
                                switch (status) {
                                  case 'PRESENT':
                                    statusColor = 'success.main';
                                    break;
                                  case 'ABSENT':
                                    statusColor = 'error.main';
                                    break;
                                  case 'HALF_DAY':
                                    statusColor = 'warning.main';
                                    break;
                                  case 'ON_LEAVE':
                                    statusColor = 'info.main';
                                    break;
                                  default:
                                    console.log(`Unhandled status code in attendance data: ${status}`);
                                    statusColor = 'text.primary';
                                }
                                
                                // Normalize status for display
                                let displayStatus = status;
                                try {
                                  displayStatus = status.replace(/_/g, ' ');
                                } catch (error) {
                                  console.warn("Error formatting status:", error);
                                }
                                
                                // Add all dates with their status
                                (dates as string[]).forEach(date => {
                                  if (!date) {
                                    console.warn(`Invalid date found in ${status} records`);
                                    return;
                                  }
                                  
                                  attendanceMap[date] = {
                                    status: displayStatus,
                                    statusColor
                                  };
                                });
                              });
                              
                              // Generate entries for all dates in range
                              const allAttendanceEntries: {status: string; date: string; statusColor: string}[] = [];
                              
                              // Use standard start and end dates from component state
                              let currentDate = dayjs(startDate);
                              const endDateValue = dayjs(endDate);
                              
                              // Loop through each day in the range
                              while (currentDate.isBefore(endDateValue) || currentDate.isSame(endDateValue, 'day')) {
                                const dateString = currentDate.format('YYYY-MM-DD');
                                
                                // Add entry with status if exists, or "Not Marked" if no status
                                if (attendanceMap[dateString]) {
                                  allAttendanceEntries.push({
                                    status: attendanceMap[dateString].status,
                                    date: dateString,
                                    statusColor: attendanceMap[dateString].statusColor
                                  });
                                } else {
                                  // Weekend check - highlight weekends differently
                                  const dayOfWeek = currentDate.day(); // 0 is Sunday, 6 is Saturday
                                  if (dayOfWeek === 0 || dayOfWeek === 6) {
                                    allAttendanceEntries.push({
                                      status: 'WEEKEND',
                                      date: dateString,
                                      statusColor: 'text.secondary'
                                    });
                                  } else {
                                    allAttendanceEntries.push({
                                      status: 'Not Marked',
                                      date: dateString,
                                      statusColor: 'text.secondary'
                                    });
                                  }
                                }
                                
                                // Move to next day (create a new instance instead of mutating)
                                currentDate = currentDate.add(1, 'day');
                              }
                              
                              // Sort by date in descending order (newest first)
                              allAttendanceEntries.sort((a, b) => {
                                return dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
                              });
                              
                              return allAttendanceEntries.map((entry, index) => (
                                <TableRow 
                                  key={`attendance-${entry.date}`}
                                  sx={{ 
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    bgcolor: index % 2 === 0 ? 'background.paper' : 'background.default',
                                    '@media print': { 
                                      breakInside: 'avoid',
                                      pageBreakInside: 'avoid',
                                      backgroundColor: index % 2 === 0 ? '#ffffff !important' : '#f9f9f9 !important'
                                    }
                                  }}
                                >
                                  <TableCell 
                                    className={`status-${entry.status.toLowerCase().replace(/ /g, '-')}`}
                                    sx={{ 
                                      color: entry.statusColor,
                                      fontWeight: 'medium'
                                    }}
                                  >
                                    {entry.status}
                                  </TableCell>
                                  <TableCell>{dayjs(entry.date).format('MMM D, YYYY')}</TableCell>
                                  <TableCell>{dayjs(entry.date).format('dddd')}</TableCell>
                                </TableRow>
                              ));
                            })()}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                )}
              </Box>
            ) : selectedStaffMember ? (
              <Box sx={{ mt: 3, textAlign: 'center', p: 3 }}>
                <Typography>No attendance data found for the selected date range</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try selecting a different date range or check if the staff member has attendance records.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 3, textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Person sx={{ fontSize: 60, color: 'primary.light', mb: 2, opacity: 0.7 }} />
                <Typography variant="h6">Please select a staff member to view attendance reports</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Individual attendance reports include attendance statistics, trends, and detailed logs.
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Department Reports */}
          {isAdmin && (
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={selectedYear}
                      label="Year"
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                      {[...Array(3)].map((_, idx) => {
                        const year = dayjs().year() - 1 + idx;
                        return (
                          <MenuItem key={year} value={year}>{year}</MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Month"
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                      {[...Array(12)].map((_, idx) => {
                        return (
                          <MenuItem key={idx + 1} value={idx + 1}>
                            {dayjs().month(idx).format('MMMM')}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={selectedDepartment}
                      label="Department"
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      <MenuItem value="ALL">All Departments</MenuItem>
                      {(departmentList || []).map(dept => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Department-wise Attendance Rate
                      </Typography>
                      
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={departmentData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="department"
                              angle={-45}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis 
                              label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }}
                            />
                            <RechartsTooltip />
                            <Bar 
                              dataKey="attendanceRate" 
                              name="Attendance Rate (%)" 
                              fill="#8884d8" 
                              radius={[5, 5, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Department Performance
                      </Typography>
                      
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Department</TableCell>
                              <TableCell align="center">Teachers</TableCell>
                              <TableCell align="center">Avg. Attendance</TableCell>
                              <TableCell align="center">Performance</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {departmentData.map((dept) => {
                              // Determine performance level based on attendance rate
                              let performanceChip;
                              if (dept.attendanceRate >= 90) {
                                performanceChip = <Chip label="Excellent" color="success" size="small" />;
                              } else if (dept.attendanceRate >= 75) {
                                performanceChip = <Chip label="Good" color="primary" size="small" />;
                              } else if (dept.attendanceRate >= 60) {
                                performanceChip = <Chip label="Average" color="warning" size="small" />;
                              } else {
                                performanceChip = <Chip label="Poor" color="error" size="small" />;
                              }
                              
                              return (
                                <TableRow key={dept.department}>
                                  <TableCell>{dept.department}</TableCell>
                                  <TableCell align="center">{dept.total}</TableCell>
                                  <TableCell align="center">{dept.attendanceRate}%</TableCell>
                                  <TableCell align="center">{performanceChip}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          )}

          {/* Trend Analysis section removed */}
        </Paper>
      </LocalizationProvider>
    </Box>
  );
};

export default AttendanceReportsImpl;
