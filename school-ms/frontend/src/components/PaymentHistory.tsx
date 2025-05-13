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
  Cancel as CancelIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Payment } from '../types/payment.types';

interface PaymentHistoryProps {
  payments: Payment[];
  onViewReceipt: (paymentId: number) => void;
  onDownloadReceipt: (paymentId: number) => void;
  onVoidPayment?: (paymentId: number) => void;
  isAdmin?: boolean;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  onViewReceipt,
  onDownloadReceipt,
  onVoidPayment,
  isAdmin = false
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleChangePage = (event: unknown, newPage: number) => {
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
  };

  const getPaymentStatusChip = (status: string) => {
    let color = 'default';
    switch (status) {
      case 'COMPLETED':
        color = 'success';
        break;
      case 'PENDING':
        color = 'warning';
        break;
      case 'FAILED':
        color = 'error';
        break;
      case 'VOID':
        color = 'default';
        break;
    }
    return <Chip size="small" label={status} color={color as any} />;
  };

  return (
    <>
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Receipt #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No payment records found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              payments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.receiptNumber || '-'}</TableCell>
                    <TableCell>
                      {payment.paymentDate 
                        ? format(new Date(payment.paymentDate), 'dd MMM yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>₹{payment.amountPaid.toLocaleString()}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>{getPaymentStatusChip(payment.paymentStatus)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(payment)}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Receipt">
                        <IconButton
                          size="small"
                          onClick={() => onViewReceipt(payment.id!)}
                          disabled={payment.paymentStatus === 'VOID'}
                        >
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Receipt">
                        <IconButton
                          size="small"
                          onClick={() => onDownloadReceipt(payment.id!)}
                          disabled={payment.paymentStatus === 'VOID'}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && onVoidPayment && payment.paymentStatus !== 'VOID' && (
                        <Tooltip title="Void Payment">
                          <IconButton
                            size="small"
                            onClick={() => onVoidPayment(payment.id!)}
                            color="error"
                          >
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

      {/* Payment Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        {selectedPayment && (
          <>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Receipt Number
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.receiptNumber || 'N/A'}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary">
                  Academic Year/Term
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.academicYear} ({selectedPayment.academicTerm})
                </Typography>

                <Typography variant="subtitle2" color="textSecondary">
                  Payment Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {format(new Date(selectedPayment.paymentDate), 'dd MMMM yyyy')}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary">
                  Payment Method
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPayment.paymentMethod}
                  {selectedPayment.transactionReference && 
                    ` (Ref: ${selectedPayment.transactionReference})`}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary">
                  Amount Paid
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  ₹{selectedPayment.amountPaid.toLocaleString()}
                </Typography>

                {selectedPayment.notes && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">
                      Notes
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedPayment.notes}
                    </Typography>
                  </>
                )}

                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                  Fee Breakdown
                </Typography>
                <Table size="small" sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fee Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>                  <TableBody>
                    {selectedPayment.feeBreakdown?.map((item: {feeType: string, amount: number, description?: string}, index: number) => (
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
              <Button 
                startIcon={<DownloadIcon />} 
                onClick={() => onDownloadReceipt(selectedPayment.id!)}
                disabled={selectedPayment.paymentStatus === 'VOID'}
                sx={{ ml: 1 }}
              >
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