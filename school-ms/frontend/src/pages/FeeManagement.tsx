import React, { useState, useEffect, useCallback } from 'react';
import {  Box,
  Tab,
  Tabs,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  InputAdornment,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Collapse,
  Stack,
  Divider,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  School as SchoolIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import feeService from '../services/feeService';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Student, studentService } from '../services/studentService';
import { Payment, StudentFeeDetails as StudentFeeDetailsType } from '../types/payment.types';
import { FeeStructure, TransportRoute } from '../services/feeService';

// Using the imported type directly 
// The type is already imported as StudentFeeDetailsType

// Import components from our tables directory
import { FeeStructureTable, TransportRouteTable } from '../components/tables';
import FeeStructureDialog from '../components/dialogs/FeeStructureDialog';
import TransportRouteDialog from '../components/dialogs/TransportRouteDialog';
import PaymentDialog from '../components/dialogs/PaymentDialog';
import PaymentHistory from '../components/PaymentHistory';
import StudentFeeDetails from '../components/StudentFeeDetails';
import { useAuth } from '../context/AuthContext';
import ReceiptDialog from '../components/dialogs/ReceiptDialog';
import Permission from '../components/Permission';
import PaymentFilters from '../components/PaymentFilters';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`fee-tabpanel-${index}`}
      aria-labelledby={`fee-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const FeeManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [feeStructureDialogOpen, setFeeStructureDialogOpen] = useState(false);
  const [transportRouteDialogOpen, setTransportRouteDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [studentIdOrName, setStudentIdOrName] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentFeeDetails, setStudentFeeDetails] = useState<StudentFeeDetailsType | null>(null);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    // Enhanced states for modern filtering
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [isViewingAllPayments, setIsViewingAllPayments] = useState(false);
  const [filterStudentName, setFilterStudentName] = useState('');
  const [isFilteringByClass, setIsFilteringByClass] = useState(false);
  const [isLoadingAllPayments, setIsLoadingAllPayments] = useState(false);
  
  // New states for modern filter UI
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ACCOUNTS';  const { 
    data: feeStructures, 
    loading: loadingFeeStructures, 
    error: feeStructuresError,
    refetch: refetchFeeStructures 
  } = useApi<FeeStructure[]>(() => feeService.getAllFeeStructures());

  const { 
    data: transportRoutes, 
    loading: loadingRoutes, 
    error: routesError,
    refetch: refetchRoutes 
  } = useApi<TransportRoute[]>(() => feeService.getAllTransportRoutes());

  const { 
    data: studentOptions, 
    loading: loadingStudentOptions   } = useApi<Student[]>(() => {
    return studentService.getAll();
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };  const handleSearchStudent = async () => {
    if (!studentIdOrName.trim()) return;
      try {      // Use the studentService that was imported at the top of the file
      const student = await studentService.search(studentIdOrName);
      if (student) {
        // Check if student is an array and handle accordingly
        const studentData = Array.isArray(student) ? student[0] : student;
        if (studentData && studentData.id) {
          setSelectedStudent(studentData);
          
          // Log student data for debugging
          console.log('Selected student:', studentData);
          
          // Fetch fee details and ensure we have a valid feeId
          const feeDetails = await fetchStudentFeeDetails(studentData.id);
          
          if (!feeDetails || !feeDetails.studentFeeId) {
            console.warn('No fee details found for student. Payments may not work correctly.');
          } else {
            console.log('Successfully loaded fee details:', feeDetails);
          }
          
          await fetchStudentPayments(studentData.id);
        } else {
          throw new Error('Invalid student data returned');
        }
      } else {
        setSnackbar({ 
          open: true, 
          message: 'Student not found', 
          severity: 'error' 
        });
        setSelectedStudent(null);
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Error searching for student', 
        severity: 'error' 
      });
    }
  };
  const fetchStudentFeeDetails = async (studentId: number) => {
    try {
      const details = await feeService.getStudentFeeDetails(studentId);
      setStudentFeeDetails(details);
      console.log('Fetched student fee details:', details);
      return details; // Return the details so they can be used by the caller
    } catch (error) {
      console.error('Error fetching student fee details:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error fetching student fee details', 
        severity: 'error' 
      });
      return null;
    }
  };
  const fetchStudentPayments = async (studentId: number) => {
    try {
      const payments = await feeService.getPaymentsByStudentId(studentId);
      setStudentPayments(payments);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Error fetching student payments', 
        severity: 'error' 
      });
    }
  };
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // New methods for enhanced filtering
  const fetchAllPayments = useCallback(async () => {
    setIsLoadingAllPayments(true);
    try {
      const filters = {
        grade: selectedClass,
        section: selectedSection,
        studentName: filterStudentName
      };
      
      const response = await feeService.getFilteredPayments(
        Object.values(filters).some(val => val) ? filters : undefined
      );
      
      setAllPayments(response);
      setIsViewingAllPayments(true);
      
      // Extract unique classes and sections from the payments data
      const classes = new Set<string>();
      const sections = new Set<string>();
      
      response.forEach(payment => {
        if (payment.studentGrade) classes.add(payment.studentGrade);
        if (payment.studentSection) sections.add(payment.studentSection);
      });
      
      setAvailableClasses(Array.from(classes).sort());
      setAvailableSections(Array.from(sections).sort());
    } catch (error) {
      console.error('Error fetching all payments:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load all payments',
        severity: 'error'
      });
    } finally {
      setIsLoadingAllPayments(false);
    }
  }, []);
    const handleClassFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedClass(value);
    updateActiveFilters('class', value);
    // Reset section when class changes
    setSelectedSection('');
    updateActiveFilters('section', '');
  };
  
  const handleSectionFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedSection(value);
    updateActiveFilters('section', value);
  };
  
  const handleStudentNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterStudentName(value);
    updateActiveFilters('student', value);
  };
  
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setStartDate(value);
    updateDateRangeFilter(value, endDate);
  };
  
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEndDate(value);
    updateDateRangeFilter(startDate, value);
  };
  
  const updateDateRangeFilter = (start: string, end: string) => {
    if (start || end) {
      const label = `${start || 'Any'} to ${end || 'Latest'}`;
      updateActiveFilters('dateRange', label);
    } else {
      updateActiveFilters('dateRange', '');
    }
  };
  
  const handlePaymentStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPaymentStatus(value);
    updateActiveFilters('status', value);
  };
  
  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPaymentMethod(value);
    updateActiveFilters('method', value);
  };
  
  const handleMinAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMinAmount(value);
    updateAmountFilter(value, maxAmount);
  };
  
  const handleMaxAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMaxAmount(value);
    updateAmountFilter(minAmount, value);
  };
  
  const updateAmountFilter = (min: string, max: string) => {
    if (min || max) {
      const label = `${min || '0'} - ${max || 'Any'}`;
      updateActiveFilters('amount', label);
    } else {
      updateActiveFilters('amount', '');
    }
  };
  
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const handleClearFilter = (filterType: string) => {
    switch (filterType) {
      case 'class':
        setSelectedClass('');
        updateActiveFilters('class', '');
        break;
      case 'section':
        setSelectedSection('');
        updateActiveFilters('section', '');
        break;
      case 'student':
        setFilterStudentName('');
        updateActiveFilters('student', '');
        break;
      case 'dateRange':
        setStartDate('');
        setEndDate('');
        updateActiveFilters('dateRange', '');
        break;
      case 'amount':
        setMinAmount('');
        setMaxAmount('');
        updateActiveFilters('amount', '');
        break;
      case 'status':
        setPaymentStatus('');
        updateActiveFilters('status', '');
        break;
      case 'method':
        setPaymentMethod('');
        updateActiveFilters('method', '');
        break;
      default:
        break;
    }
    
    // Re-fetch payments with updated filters after a small delay
    setTimeout(() => fetchAllPayments(), 0);
  };

  const updateActiveFilters = (filterType: string, value: string) => {
    if (!value) {
      setActiveFilters(prev => prev.filter(filter => !filter.startsWith(filterType)));
    } else {
      const filterLabel = `${filterType}:${value}`;
      if (!activeFilters.includes(filterLabel)) {
        setActiveFilters(prev => [...prev.filter(filter => !filter.startsWith(filterType)), filterLabel]);
      }
    }
  };
  const switchToStudentView = () => {
    setIsViewingAllPayments(false);
    resetFilters();
    // Reset all data related to all payments
    setAllPayments([]);
    setAvailableClasses([]);
    setAvailableSections([]);
  };

  const handleViewAllPayments = async () => {
    resetStudentData();
    // Expanded filter UI should be initially shown
    setFiltersExpanded(true);
    await fetchAllPayments();
    
    setSnackbar({
      open: true,
      message: 'Showing all payments. Use filters to narrow results.',
      severity: 'success'
    });
  };

  const handlePaymentSuccess = async () => {
    setPaymentDialogOpen(false);
    setSnackbar({ 
      open: true, 
      message: 'Payment processed successfully', 
      severity: 'success' 
    });
    
    if (selectedStudent?.id) {
      await fetchStudentFeeDetails(selectedStudent.id);
      await fetchStudentPayments(selectedStudent.id);
    }
  };

  const handleViewReceipt = (paymentId: number) => {
    setSelectedPaymentId(paymentId);
    setReceiptDialogOpen(true);
  };

  const handleDownloadReceipt = async (paymentId: number) => {
    try {
      await feeService.downloadReceipt(paymentId);
      setSnackbar({ 
        open: true, 
        message: 'Receipt downloaded successfully', 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Error downloading receipt', 
        severity: 'error' 
      });
    }
  };
  const handleVoidPayment = async (paymentId: number) => {
    if (!window.confirm('Are you sure you want to void this payment? This action cannot be undone.')) {
      return;
    }
    
    try {
      await feeService.voidPayment(paymentId, 'Voided by admin');
      setSnackbar({ 
        open: true, 
        message: 'Payment voided successfully', 
        severity: 'success' 
      });
      
      if (selectedStudent?.id) {
        await fetchStudentFeeDetails(selectedStudent.id);
        await fetchStudentPayments(selectedStudent.id);
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Error voiding payment', 
        severity: 'error' 
      });
    }
  };

  const resetStudentData = () => {
    setSelectedStudent(null);
    setStudentIdOrName('');
    setStudentFeeDetails(null);
    setStudentPayments([]);
  };

  // New resetFilters method
  const resetFilters = () => {
    setSelectedClass('');
    setSelectedSection('');
    setFilterStudentName('');
    setActiveFilters([]);
    setStartDate('');
    setEndDate('');
    setPaymentStatus('');
    setPaymentMethod('');
    setMinAmount('');
    setMaxAmount('');
    setIsFilteringByClass(false);
    
    // Refresh to get unfiltered payments
    if (isViewingAllPayments) {
      // Small delay to ensure state is updated before the API call
      setTimeout(() => fetchAllPayments(), 0);
    }  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="fee management tabs">
          <Tab label="Fee Structures" />
          <Tab label="Transport Routes" />
          <Tab label="Payments" />
        </Tabs>
      </Box>

      {/* Fee Structures Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Fee Structures</Typography>          <Permission permissions={['MANAGE_FEES']}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFeeStructureDialogOpen(true)}
            >
              Add Fee Structure
            </Button>
          </Permission>
        </Box>
        
        {loadingFeeStructures ? (
          <Loading />
        ) : feeStructuresError ? (
          <ErrorMessage message="Error loading fee structures" />
        ) : feeStructures ? (          <FeeStructureTable 
            feeStructures={feeStructures}
            onEdit={(id: number) => console.log('Edit fee structure:', id)}
            onDelete={(id: number) => console.log('Delete fee structure:', id)}
            onRefresh={refetchFeeStructures}
          />
        ) : null}
      </TabPanel>

      {/* Transport Routes Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Transport Routes</Typography>          <Permission permissions={['MANAGE_FEES']}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTransportRouteDialogOpen(true)}
            >
              Add Transport Route
            </Button>
          </Permission>
        </Box>
        
        {loadingRoutes ? (
          <Loading />
        ) : routesError ? (
          <ErrorMessage message="Error loading transport routes" />
        ) : transportRoutes ? (          <TransportRouteTable 
            transportRoutes={transportRoutes}
            onEdit={(id: number) => console.log('Edit route:', id)}
            onDelete={(id: number) => console.log('Delete route:', id)}
            onRefresh={refetchRoutes}
          />
        ) : null}
      </TabPanel>      {/* Payments Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {isViewingAllPayments ? "All Payments" : "Student Fee Management"}
          </Typography>
          <Paper sx={{ p: 2 }}>
            {!isViewingAllPayments ? (
              // Individual student search
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <Autocomplete
                    options={studentOptions || []}
                    getOptionLabel={(option) => `${option.name} (${option.id})`}
                    value={selectedStudent}
                    onChange={(event, newValue) => {
                      setSelectedStudent(newValue);
                      if (newValue?.id) {
                        fetchStudentFeeDetails(newValue.id);
                        fetchStudentPayments(newValue.id);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Student"
                        variant="outlined"
                        fullWidth
                        onChange={(e) => setStudentIdOrName(e.target.value)}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingStudentOptions ? (
                                <Loading size={20} />
                              ) : (
                                params.InputProps.endAdornment
                              )}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleSearchStudent}
                  >
                    Search
                  </Button>
                </Grid>
                <Grid item>
                  <Tooltip title="Reset">
                    <IconButton onClick={resetStudentData}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleViewAllPayments}
                  >
                    View All Payments
                  </Button>                </Grid>
              </Grid>
            ) : (
              // Use our reusable PaymentFilters component for a modern UI
              <PaymentFilters 
                selectedClass={selectedClass}
                selectedSection={selectedSection}
                filterStudentName={filterStudentName}
                availableClasses={availableClasses}
                availableSections={availableSections}
                startDate={startDate}
                endDate={endDate}
                paymentStatus={paymentStatus}
                paymentMethod={paymentMethod}
                minAmount={minAmount}
                maxAmount={maxAmount}
                activeFilters={activeFilters}
                onClassChange={handleClassFilterChange}
                onSectionChange={handleSectionFilterChange}
                onStudentNameChange={handleStudentNameFilterChange}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onPaymentStatusChange={handlePaymentStatusChange}
                onPaymentMethodChange={handlePaymentMethodChange}
                onMinAmountChange={handleMinAmountChange}
                onMaxAmountChange={handleMaxAmountChange}
                onClearFilter={handleClearFilter}
                onResetFilters={resetFilters}
                onApplyFilters={fetchAllPayments}                onSwitchToStudentView={switchToStudentView}
              />
            )}
          </Paper>
        </Box>

        {selectedStudent && (
          <>
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {selectedStudent.name}'s Fee Details
                  </Typography>
                  <Permission permissions={['MANAGE_FEES']}>
                    <Button
                      variant="contained"
                      startIcon={<ReceiptIcon />}
                      onClick={() => setPaymentDialogOpen(true)}
                      disabled={!studentFeeDetails}
                    >
                      Record Payment
                    </Button>
                  </Permission>
                </Box>
                {studentFeeDetails ? (
                  <StudentFeeDetails feeDetails={studentFeeDetails} />
                ) : (
                  <Typography>No fee details available for this student</Typography>
                )}
              </Paper>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Payment History</Typography>
              <PaymentHistory 
                payments={studentPayments}
                onViewReceipt={handleViewReceipt}
                onDownloadReceipt={handleDownloadReceipt}
                onVoidPayment={handleVoidPayment}
                isAdmin={isAdmin}
              />
            </Box>
          </>
        )}        {isViewingAllPayments && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>All Payments</Typography>
            <PaymentHistory 
              payments={allPayments}
              onViewReceipt={handleViewReceipt}
              onDownloadReceipt={handleDownloadReceipt}
              onVoidPayment={isAdmin ? handleVoidPayment : undefined}
              isAdmin={isAdmin}
              showStudentDetails={true}
            />
          </Box>
        )}
      </TabPanel>      {/* Fee Structure Dialog */}      {feeStructureDialogOpen && (
        <FeeStructureDialog 
          open={feeStructureDialogOpen}
          onClose={() => setFeeStructureDialogOpen(false)}          onSubmit={async (data: FeeStructure) => {
            try {
              // Import the utility for creating fee structures
              const { createFeeStructure } = await import('../utils/createFeeStructure');
              
              // Use the utility to create the fee structure with validation and processing
              await createFeeStructure(data);
              
              setFeeStructureDialogOpen(false);
              refetchFeeStructures();
              
              setSnackbar({ 
                open: true, 
                message: 'Fee structure created successfully', 
                severity: 'success' 
              });
            } catch (error) {
              console.error('Error creating fee structure:', error);
              setSnackbar({
                open: true,
                message: `Failed to create fee structure: ${error instanceof Error ? error.message : 'Unknown error'}`,
                severity: 'error'
              });
            }
          }}
        />
      )}

      {/* Transport Route Dialog */}
      {transportRouteDialogOpen && (
        <TransportRouteDialog 
          open={transportRouteDialogOpen}
          onClose={() => setTransportRouteDialogOpen(false)}
          onSubmit={async (data: TransportRoute) => {
            await feeService.createTransportRoute(data);
            setTransportRouteDialogOpen(false);
            refetchRoutes();
            setSnackbar({ 
              open: true, 
              message: 'Transport route created successfully', 
              severity: 'success' 
            });
          }}
        />
      )}

      {/* Payment Dialog */}      {paymentDialogOpen && selectedStudent && studentFeeDetails && (
        <PaymentDialog 
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          studentId={selectedStudent.id ?? null}
          onSubmit={async (payment) => {
            try {
              // Import utilities
              const { debugPayment } = await import('../utils/debugUtils');
              const { processPayment } = await import('../services/paymentHandler');
              
              // Log initial payment data for debugging
              debugPayment('Payment Submission Start', payment);
              
              // Ensure all required properties are present and have valid values
              if (!payment.studentId || !payment.amount || !payment.paymentDate) {
                const error = new Error('Missing required payment information');
                debugPayment('Payment Validation Failed', payment, error);
                throw error;
              }
              
              // Ensure we have a valid feeId (studentFeeId)
              if (!payment.feeId && !payment.studentFeeId && studentFeeDetails) {
                // Try to get the fee ID from studentFeeDetails
                payment.feeId = studentFeeDetails.studentFeeId || studentFeeDetails.feeStructure?.id;
                debugPayment('Added missing feeId to payment', payment);
              }
              
              // Use our enhanced payment processor that handles CORS issues
              const result = await processPayment(payment);
              debugPayment('Payment Created Successfully', result);
              handlePaymentSuccess();
            } catch (error: any) {
              // Import error reporting service
              const { reportPaymentError } = await import('../services/errorReporting');
              
              // Generate detailed error diagnostics
              const diagnostics = reportPaymentError(error, payment);
              console.error('Payment processing error diagnostics:', diagnostics);
              
              // Provide more specific error messages based on error type
              let errorMessage = 'Error processing payment';
              
              if (diagnostics.corsRelated) {
                errorMessage = 'Network error processing payment. This appears to be a CORS-related issue.';
              } else if (diagnostics.validationRelated) {
                const validationErrors = error.validationErrors || 
                                       error.response?.data?.validationErrors || 
                                       error.response?.data?.errors || 
                                       error.response?.data?.fieldErrors;
                                       
                if (validationErrors) {
                  const errorFields = Object.keys(validationErrors).join(', ');
                  errorMessage = `Validation error with fields: ${errorFields}`;
                } else if (error.response?.data?.message) {
                  errorMessage = `Validation error: ${error.response.data.message}`;
                }
              } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
              }
              
              setSnackbar({ 
                open: true, 
                message: errorMessage, 
                severity: 'error' 
              });
            }
          }}
          loading={false}
        />
      )}

      {/* Receipt Dialog */}      {receiptDialogOpen && selectedPaymentId !== null && (
        <ReceiptDialog 
          open={receiptDialogOpen}
          payment={
            // Use type assertion to avoid TypeScript errors
            {
              id: selectedPaymentId,
              studentId: selectedStudent?.id || 0,
              paymentDate: new Date().toISOString(),
              amount: 0,
              amountPaid: 0,
              paymentMethod: 'CASH',
              frequency: 'MONTHLY',
              paymentStatus: 'PAID',
              academicYear: '2024-2025',
              academicTerm: 'TERM1'
            } as Payment
          }
          studentName={selectedStudent?.name || 'Student'}
          className={`Grade ${studentFeeDetails?.feeStructure?.classGrade || 'N/A'}`}
          onClose={() => {
            setReceiptDialogOpen(false);
            setSelectedPaymentId(null);
          }}
          onDownload={() => {
            if (selectedPaymentId !== null) {
              handleDownloadReceipt(selectedPaymentId);
            }
          }}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeeManagement;