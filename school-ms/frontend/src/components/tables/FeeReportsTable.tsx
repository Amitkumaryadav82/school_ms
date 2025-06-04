import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Button,
  TablePagination,
  Chip
} from '@mui/material';
import { GetApp as DownloadIcon } from '@mui/icons-material';
import { PaymentSummary } from '../../services/feeService';

interface FeeReportsTableProps {
  data: PaymentSummary[];
  reportType: 'students-with-fees-due' | 'fee-payment-status' | '';
  classGrade?: number | null;
  onDownload: () => void;
}

const FeeReportsTable: React.FC<FeeReportsTableProps> = ({ 
  data, 
  reportType, 
  classGrade,
  onDownload 
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const displayTitle = () => {
    const baseTitle = reportType === 'students-with-fees-due' 
      ? 'Students with Fees Due' 
      : 'Fee Payment Status';
    
    return classGrade 
      ? `${baseTitle} - Grade ${classGrade}` 
      : `${baseTitle} - All Classes`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{displayTitle()}</Typography>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />}
          onClick={onDownload}
        >
          Download
        </Button>
      </Box>
      <TableContainer>
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="fee reports table"
          size="medium"
        >
          <TableHead>
            <TableRow>              <TableCell>Student ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell align="right">Total Due (₹)</TableCell>
              <TableCell align="right">Total Paid (₹)</TableCell>
              <TableCell align="right">Balance (₹)</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Last Payment Date</TableCell>
              <TableCell>Next Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={row.studentId} hover>
                <TableCell>{row.studentId}</TableCell>
                <TableCell>{row.studentName}</TableCell>                <TableCell align="right">₹{row.totalDue.toFixed(2)}</TableCell>
                <TableCell align="right">₹{row.totalPaid.toFixed(2)}</TableCell>
                <TableCell align="right">₹{row.balance.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.paymentStatus.replace('_', ' ')} 
                    color={getStatusColor(row.paymentStatus) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(row.lastPaymentDate)}</TableCell>
                <TableCell>{formatDate(row.nextDueDate)}</TableCell>
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={8} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default FeeReportsTable;
