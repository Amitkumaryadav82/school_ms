import React, { useState } from 'react';
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
  IconButton,
  Chip,
  Button,
  Tooltip,
  TablePagination,
  Dialog
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  GetApp as DownloadIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Payment } from '../types/payment.types';

interface PaymentHistoryProps {
  payments: Payment[];
  onViewReceipt: (paymentId: number) => void;
  onDownloadReceipt: (paymentId: number) => void;
  onVoidPayment?: (paymentId: number) => void;
  isAdmin?: boolean;
  showStudentDetails?: boolean; // when true, show student-related columns
  showClassSection?: boolean;   // when true, show Class and Section columns (default true)
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  onViewReceipt,
  onDownloadReceipt,
  onVoidPayment,
  isAdmin = false,
  showStudentDetails = false,
  showClassSection = true,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedPayment(null);
  };

  const getPaymentStatusChip = (status: string) => {
    let color: 'default' | 'success' | 'warning' | 'error' = 'default';
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
        color = 'success';
        break;
      case 'PENDING':
      case 'PARTIAL':
        color = 'warning';
        break;
      case 'FAILED':
      case 'OVERDUE':
      case 'CANCELLED':
        color = 'error';
        break;
      case 'VOID':
        color = 'default';
        break;
    }
    return <Chip size="small" label={status} color={color as any} />;
  };

  const paged = payments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const empty = payments.length === 0;

  return (
    <>
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Receipt #</TableCell>
              {showStudentDetails && <TableCell>Student</TableCell>}
              {showStudentDetails && showClassSection && (
                <>
                  <TableCell>Class</TableCell>
                  <TableCell>Section</TableCell>
                </>
              )}
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Void Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {empty ? (
              <TableRow>
                <TableCell colSpan={showStudentDetails ? (showClassSection ? 10 : 8) : 7} align="center">
                  <Typography variant="body2" color="textSecondary">No payment records found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.receiptNumber || '-'}</TableCell>
                  {showStudentDetails && (
                    <TableCell>{payment.studentName || (payment as any)?.student?.name || '-'}</TableCell>
                  )}
                  {showStudentDetails && showClassSection && (
                    <>
                      <TableCell>{payment.studentGrade || '-'}</TableCell>
                      <TableCell>{payment.studentSection || '-'}</TableCell>
                    </>
                  )}
                  <TableCell>
                    {payment.paymentDate ? format(new Date(payment.paymentDate), 'dd MMM yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    ₹{Number(payment.amountPaid ?? payment.amount ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>
                    {payment.paymentStatus === 'VOID' && payment.voidedAt
                      ? format(new Date(payment.voidedAt), 'dd MMM yyyy HH:mm')
                      : '-'}
                  </TableCell>
                  <TableCell>{getPaymentStatusChip(payment.paymentStatus)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Receipt">
                      <IconButton size="small" onClick={() => onViewReceipt(payment.id!)}>
                        <ReceiptIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Receipt">
                      <IconButton size="small" onClick={() => onDownloadReceipt(payment.id!)}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {isAdmin && onVoidPayment && payment.paymentStatus !== 'VOID' && (
                      <Tooltip title="Void Payment">
                        <IconButton size="small" onClick={() => onVoidPayment(payment.id!)} color="error">
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {payments.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={payments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </TableContainer>

      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        {selectedPayment && (
          <>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Payment Details</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">Receipt Number</Typography>
                <Typography variant="body1" gutterBottom>{selectedPayment.receiptNumber || 'N/A'}</Typography>

                <Typography variant="subtitle2" color="textSecondary">Academic Year/Term</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.academicYear} ({selectedPayment.academicTerm})
                </Typography>

                <Typography variant="subtitle2" color="textSecondary">Payment Date</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.paymentDate ? format(new Date(selectedPayment.paymentDate), 'dd MMMM yyyy') : '-'}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary">Payment Method</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.paymentMethod}
                  {selectedPayment.transactionReference && ` (Ref: ${selectedPayment.transactionReference})`}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary">Amount Paid</Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  ₹{Number(selectedPayment.amountPaid ?? selectedPayment.amount ?? 0).toLocaleString()}
                </Typography>

                {selectedPayment.paymentStatus === 'VOID' && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">Date of Payment Void</Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPayment.voidedAt ? format(new Date(selectedPayment.voidedAt), 'dd MMM yyyy HH:mm') : '-'}
                    </Typography>

                    <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedPayment.voidReason || selectedPayment.remarks || '-'}
                    </Typography>
                  </>
                )}

                {selectedPayment.notes && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                    <Typography variant="body2" gutterBottom>{selectedPayment.notes}</Typography>
                  </>
                )}

                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Fee Breakdown</Typography>
                <Table size="small" sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fee Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPayment.feeBreakdown?.map((item: { feeType: string; amount: number; description?: string }, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.feeType}</TableCell>
                        <TableCell>{item.description || '-'}</TableCell>
                        <TableCell align="right">₹{item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
              <Button onClick={handleCloseDetails}>Close</Button>
              <Button startIcon={<DownloadIcon />} onClick={() => onDownloadReceipt(selectedPayment.id!)} sx={{ ml: 1 }}>
                Download Receipt
              </Button>
            </Box>
          </>
        )}
      </Dialog>
    </>
  );
};

export default PaymentHistory;