import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Divider,
  Paper,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Receipt as ReceiptIcon, 
  Print as PrintIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { Payment } from '../../types/payment.types';
import { notificationService } from '../../services/notificationService';

// Define the enums that are referenced but not exported from feeService
enum PaymentMethod {
  CASH = 'CASH',
  CHECK = 'CHECK',
  CHEQUE = 'CHEQUE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  UPI = 'UPI',
  CREDIT_CARD = 'CREDIT_CARD',
  ONLINE = 'ONLINE'
}

enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY'
}

interface ReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  payment: Payment;
  onDownload: () => void;
  studentName: string;
  className: string;
  studentId?: number;
  parentEmail?: string;
}

const paymentMethodLabels: Record<string, string> = {
  'CASH': 'Cash',
  'CHEQUE': 'Cheque',
  'CHECK': 'Check',
  'BANK_TRANSFER': 'Bank Transfer',
  'UPI': 'UPI',
  'ONLINE': 'Online',
  'CREDIT_CARD': 'Credit Card'
};

const frequencyLabels: Record<string, string> = {
  'MONTHLY': 'Monthly',
  'QUARTERLY': 'Quarterly',
  'HALF_YEARLY': 'Half-Yearly',
  'YEARLY': 'Annual'
};

const ReceiptDialog: React.FC<ReceiptDialogProps> = ({
  open,
  onClose,
  payment,
  studentName,
  className,
  studentId,
  parentEmail = ''
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [emailTo, setEmailTo] = useState(parentEmail);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });    const handlePrint = useReactToPrint({
    documentTitle: `Receipt_${payment?.id || 'Unknown'}_${studentName?.replace(/\s+/g, '_') || 'Student'}`,
    onAfterPrint: () => {
      console.log('Print complete');
    },
    // @ts-ignore - content prop seems to be missing in the type definitions
    content: () => receiptRef.current
  });

  const handleSendEmail = async () => {
    if (!payment || !studentId) return;
    
    try {
      setSendingEmail(true);
      const response = await notificationService.sendFeeReceiptEmail(
        studentId,
        payment.id!,
        emailTo
      );
      
      setNotification({
        open: true,
        message: 'Receipt has been sent successfully to ' + emailTo,
        severity: 'success'
      });
      
      setShowEmailForm(false);
    } catch (error) {
      console.error('Failed to send receipt email:', error);
      setNotification({
        open: true,
        message: 'Failed to send email. Please try again.',
        severity: 'error'
      });
    } finally {
      setSendingEmail(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  if (!payment) return null;
  
  // Format receipt number with leading zeros
  const receiptNumber = `R${String(payment.id).padStart(6, '0')}`;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <ReceiptIcon sx={{ mr: 1 }} />
        Payment Receipt
      </DialogTitle>
      
      <DialogContent>
        <Box ref={receiptRef} sx={{ p: 2 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px dashed #ccc' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h5" gutterBottom>SCHOOL MANAGEMENT SYSTEM</Typography>
                  <Typography variant="body2" color="textSecondary">123 Education Street, City, Country</Typography>
                  <Typography variant="body2" color="textSecondary">Phone: +91 1234567890</Typography>
                  <Typography variant="body2" color="textSecondary">Email: info@schoolms.com</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6">RECEIPT</Typography>
                  <Typography variant="body1">{receiptNumber}</Typography>
                  <Typography variant="body2">Date: {format(new Date(payment.paymentDate), 'dd MMM yyyy')}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>STUDENT DETAILS</Typography>
                <Typography variant="body1">{studentName}</Typography>
                <Typography variant="body2">Class: {className}</Typography>
                <Typography variant="body2">Student ID: {payment.studentId}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>PAYMENT DETAILS</Typography>                <Typography variant="body2">
                  <strong>Payment Type:</strong> {payment.frequency && frequencyLabels[payment.frequency] ? frequencyLabels[payment.frequency] : payment.frequency} Fee
                </Typography>
                <Typography variant="body2">
                  <strong>Payment Method:</strong> {payment.paymentMethod && paymentMethodLabels[payment.paymentMethod] ? paymentMethodLabels[payment.paymentMethod] : payment.paymentMethod}
                </Typography>
                {payment.reference && (
                  <Typography variant="body2">
                    <strong>Reference:</strong> {payment.reference}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ 
                  backgroundColor: '#f5f5f5', 
                  p: 2, 
                  borderRadius: 1,
                  mt: 2
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>                      <Typography variant="subtitle1">
                        {payment.frequency && frequencyLabels[payment.frequency] ? frequencyLabels[payment.frequency] : payment.frequency} Fee Payment
                      </Typography>
                      {payment.notes && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          Notes: {payment.notes}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                      <Typography variant="subtitle1">
                        ₹{payment.amount.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Box>
                  <Typography variant="h6">TOTAL PAID: ₹{payment.amount.toLocaleString()}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 4 }}>
                <Divider />
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mt: 3,
                  alignItems: 'flex-end'
                }}>
                  <Box sx={{ maxWidth: '50%' }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Received with thanks</strong>
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      This is a computer generated receipt and doesn't require a signature.
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', borderTop: '1px solid #000', pt: 1, minWidth: '150px' }}>
                    <Typography variant="body2">Authorized Signature</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        
        {showEmailForm && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Send Receipt via Email
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Email Address"
              variant="outlined"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="parent@example.com"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                size="small" 
                onClick={() => setShowEmailForm(false)} 
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSendEmail}
                disabled={!emailTo || sendingEmail}
              >
                {sendingEmail ? 'Sending...' : 'Send'}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Box>
          {!showEmailForm && studentId && (
            <Button 
              startIcon={<EmailIcon />} 
              onClick={() => setShowEmailForm(true)} 
              sx={{ mr: 1 }}
            >
              Email Receipt
            </Button>
          )}
          <Button 
            startIcon={<PrintIcon />} 
            variant="contained" 
            onClick={handlePrint}
          >
            Print Receipt
          </Button>
        </Box>
      </DialogActions>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ReceiptDialog;