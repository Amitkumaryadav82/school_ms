import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  TextField,
  Tooltip,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Description as DescriptionIcon,
  GetApp as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { FeePaymentSummary, PaymentSummary } from '../services/feeService';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import feeService from '../services/feeService';

interface FeeReportsTableProps {
  reportType: 'students-with-fees-due' | 'fee-payment-status' | '';
  classGrade: number | null;
  onDownload: () => void;
}

const FeeReportsTable: React.FC<FeeReportsTableProps> = ({ reportType, classGrade, onDownload }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
    useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let result: any[];
        if (reportType === 'students-with-fees-due') {
          result = await feeService.generateFeesDueReport(classGrade);
        } else if (reportType === 'fee-payment-status') {
          result = await feeService.generateFeeStatusReport(classGrade);
        } else {
          result = [];
        }          // Log the received data for debugging
        console.log('Received fee report data:', result);
        
        // Normalize data to ensure consistent field names
        const normalizedData = result.map(item => {
          console.log("Processing fee report item:", item);
          
          // For student name, handle special case where feeName contains the student name instead
          let studentName = item.studentName;
          if (!studentName && item.feeName) {
            studentName = item.feeName;
          }
          
          // For calculating status
          const totalDue = item.totalAmount || item.totalDue || 0;
          const totalPaid = item.paidAmount || item.totalPaid || 0;
          const balance = item.remainingAmount || item.balance || (totalDue - totalPaid);
          let paymentStatus = item.status || item.paymentStatus || 'UNKNOWN';
          
          // Convert enum PaymentStatus to string representation
          if (typeof paymentStatus === 'object' && paymentStatus !== null) {
            paymentStatus = String(paymentStatus);
          }
          
          // Normalize payment status to expected values
          if (paymentStatus === 'COMPLETED' || paymentStatus === 'PAID') {
            paymentStatus = 'PAID';
          } else if (paymentStatus === 'PENDING' && totalPaid > 0) {
            paymentStatus = 'PARTIALLY_PAID';
          } else if (paymentStatus === 'PENDING' && totalPaid <= 0) {
            paymentStatus = 'UNPAID';
          }
          
          // If overdue flag is set, mark as OVERDUE regardless of payment status
          if (item.isOverdue === true) {
            paymentStatus = 'OVERDUE';
          }
          
          return {
            studentId: item.studentId || 0,
            studentName: studentName || 'Unknown Student',
            totalDue: totalDue,
            totalPaid: totalPaid,
            balance: balance,
            paymentStatus: paymentStatus,
            lastPaymentDate: item.lastPaymentDate,
            nextDueDate: item.nextDueDate || item.dueDate,
            isOverdue: item.isOverdue === true || (paymentStatus === 'OVERDUE')
          };
        });
        
        setData(normalizedData);
        setFilteredData(normalizedData);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to fetch report data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [reportType, classGrade]);
  
  // Apply filters when search term or status filter changes
  useEffect(() => {
    let result = [...data];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const lowercaseSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.studentName?.toLowerCase().includes(lowercaseSearch) || 
        String(item.studentId).includes(lowercaseSearch)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.paymentStatus === statusFilter);
    }
    
    setFilteredData(result);
  }, [searchTerm, statusFilter, data]);

  const getReportTitle = () => {
    if (reportType === 'students-with-fees-due') {
      return classGrade ? `Students with Fees Due - Grade ${classGrade}` : 'Students with Fees Due - All Classes';
    } else if (reportType === 'fee-payment-status') {
      return classGrade ? `Fee Payment Status - Grade ${classGrade}` : 'Fee Payment Status - All Classes';
    }
    return 'Fee Report';
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PARTIALLY_PAID':
        return 'warning';
      case 'UNPAID':
        return 'error';
      case 'OVERDUE':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
    const getTotalStats = () => {
    const totalDue = filteredData.reduce((sum, row) => sum + (row.totalDue || 0), 0);
    const totalPaid = filteredData.reduce((sum, row) => sum + (row.totalPaid || 0), 0);
    const totalBalance = filteredData.reduce((sum, row) => sum + (row.balance || 0), 0);
    
    return { totalDue, totalPaid, totalBalance };
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }  if (!data || data.length === 0 || data.every(item => (item.totalDue || item.totalAmount || 0) === 0)) {    // Check if we have students but they have no fees associated
    const hasStudentsWithoutFees = data && data.length > 0 && data.every(item => (item.totalDue || item.totalAmount || 0) === 0);
    const isGrade1or9 = classGrade === 1 || classGrade === 9;
    
    return (
      <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f9f9f9' }}>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>No report data to display</Typography>
        <Typography color="textSecondary" sx={{ mb: 1 }}>
          {hasStudentsWithoutFees ? (
            'Students found, but no fees have been assigned to them.'
          ) : (
            reportType === 'students-with-fees-due'
              ? 'No students with fees due found for the selected criteria.'
              : 'No fee payment status data available for the selected criteria.'
          )}
        </Typography>
        <Typography color="textSecondary" sx={{ mb: 2, fontSize: '0.9rem' }}>
          {hasStudentsWithoutFees ? (
            isGrade1or9
              ? `Grade ${classGrade} students exist but have no fees assigned. Please add fees for Grade ${classGrade} in the Fee Management section.`
              : 'Students exist but have no fees assigned for their grade. Please add fee structures in the Fee Management section.'
          ) : (
            isGrade1or9
              ? `Known issue with Grade ${classGrade}: Students may exist but aren't being properly associated with fees. The app will now attempt to fix this issue automatically.`
              : (classGrade 
                ? `Try selecting a different grade or view all classes.` 
                : `Try narrowing down your search by selecting a specific grade.`)
          )}
        </Typography>
        {isGrade1or9 && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Reload Page to Apply Fix
          </Button>
        )}
      </Paper>
    );
  }
  
  const { totalDue, totalPaid, totalBalance } = getTotalStats();

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <Box sx={{ p: 3, backgroundColor: '#f5f9ff', borderBottom: '1px solid #e0e0e0' }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1565C0' }}>{getReportTitle()}</Typography>
            <Typography variant="body2" color="textSecondary">
              {`Showing ${filteredData.length} of ${data.length} records`}
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<DownloadIcon />} 
              onClick={onDownload}
              sx={{ textTransform: 'none' }}
            >
              Download Report
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ p: 2, backgroundColor: '#ffffff' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField 
              fullWidth
              variant="outlined"
              placeholder="Search by student name or ID"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={statusFilter}
                label="Payment Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
                <MenuItem value="UNPAID">Unpaid</MenuItem>
                <MenuItem value="OVERDUE">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ p: 2, backgroundColor: '#f5f9ff', borderTop: '1px solid #e0e0e0' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#ffffff' }}>
              <Typography variant="subtitle2" color="textSecondary">Total Due</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1565C0' }}>
                {formatCurrency(totalDue)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#ffffff' }}>
              <Typography variant="subtitle2" color="textSecondary">Total Paid</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {formatCurrency(totalPaid)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#ffffff' }}>
              <Typography variant="subtitle2" color="textSecondary">Outstanding Balance</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: totalBalance > 0 ? '#f44336' : '#4caf50' }}>
                {formatCurrency(totalBalance)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      <Divider />
      
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="fee report table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f9ff' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Due</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Paid</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Balance</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Last Payment</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Next Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => {
                const isOverdue = row.isOverdue || (row.paymentStatus === 'OVERDUE');
                return (
                  <TableRow 
                    key={row.studentId} 
                    hover
                    sx={{
                      backgroundColor: isOverdue ? 'rgba(244, 67, 54, 0.05)' : 'inherit'
                    }}
                  >                    <TableCell>{row.studentId}</TableCell>
                    <TableCell>{row.studentName}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.totalDue)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.totalPaid)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.balance)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={row.paymentStatus.replace('_', ' ')} 
                        color={getStatusColor(row.paymentStatus)} 
                        size="small"
                        sx={{ fontWeight: 500 }}
                        icon={row.isOverdue ? <WarningIcon /> : undefined}
                      />
                    </TableCell>
                    <TableCell>{formatDate(row.lastPaymentDate)}</TableCell>
                    <TableCell>{formatDate(row.nextDueDate)}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary" sx={{ py: 2 }}>
                    No matching records found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default FeeReportsTable;
