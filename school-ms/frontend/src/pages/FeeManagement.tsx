import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
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
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import feeService from '../services/feeService';
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
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);  const [studentIdOrName, setStudentIdOrName] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentFeeDetails, setStudentFeeDetails] = useState<StudentFeeDetailsType | null>(null);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
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
  };
  const handleSearchStudent = async () => {
    if (!studentIdOrName.trim()) return;
      try {      // Use the studentService that was imported at the top of the file
      const student = await studentService.search(studentIdOrName);
      if (student) {
        setSelectedStudent(student);
        await fetchStudentFeeDetails(student.id);
        await fetchStudentPayments(student.id);
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
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Error fetching student fee details', 
        severity: 'error' 
      });
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
      </TabPanel>

      {/* Payments Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Student Fee Management</Typography>
          <Paper sx={{ p: 2 }}>
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
            </Grid>
          </Paper>
        </Box>

        {selectedStudent && (
          <>
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {selectedStudent.name}'s Fee Details
                  </Typography>                  <Permission permissions={['MANAGE_FEES']}>
                    <Button
                      variant="contained"
                      startIcon={<ReceiptIcon />}
                      onClick={() => setPaymentDialogOpen(true)}
                      disabled={!studentFeeDetails}
                    >
                      Record Payment
                    </Button>
                  </Permission>
                </Box>                {studentFeeDetails ? (
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
        )}
      </TabPanel>

      {/* Fee Structure Dialog */}      {feeStructureDialogOpen && (
        <FeeStructureDialog 
          open={feeStructureDialogOpen}
          onClose={() => setFeeStructureDialogOpen(false)}
          onSubmit={async (data: FeeStructure) => {
            await feeService.createFeeStructure(data);
            setFeeStructureDialogOpen(false);
            refetchFeeStructures();
            setSnackbar({ 
              open: true, 
              message: 'Fee structure created successfully', 
              severity: 'success' 
            });
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

      {/* Payment Dialog */}
      {paymentDialogOpen && selectedStudent && studentFeeDetails && (
        <PaymentDialog 
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          studentId={selectedStudent.id ?? null}
          onSubmit={async (payment) => {
            try {
              await feeService.createPayment(payment);
              handlePaymentSuccess();
            } catch (error) {
              setSnackbar({ 
                open: true, 
                message: 'Error processing payment', 
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