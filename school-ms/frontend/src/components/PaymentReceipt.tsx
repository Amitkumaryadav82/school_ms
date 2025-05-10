import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Download as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import * as feeService from '../services/feeService';
import * as feeNotificationService from '../services/feeNotificationService';

interface PaymentReceiptProps {
  paymentId: number;
  receiptData?: {
    receiptNumber: string;
    paymentDate: string;
    studentName: string;
    studentId: number;
    class: string;
    amount: number;
    paymentMode: string;
    transactionReference?: string;
    description: string;
    balanceRemaining: number;
    createdBy: string;
  };
  onClose?: () => void;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ 
  paymentId, 
  receiptData,
  onClose 
}) => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendEmail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await feeNotificationService.sendPaymentReceiptNotification(paymentId);
      if (response.success) {
        setEmailSent(true);
      } else {
        setError(response.message || 'Failed to send receipt email');
      }
    } catch (err) {
      setError('An error occurred while sending the receipt email');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await feeService.downloadReceipt(paymentId);
    } catch (err) {
      setError('An error occurred while downloading the receipt');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!receiptData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading receipt...
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: 3,
        '@media print': {
          width: '100%',
          margin: 0,
          padding: 0
        }
      }}
      className="receipt-container"
    >
      {emailSent && (
        <Alert 
          severity="success" 
          sx={{ mb: 2, display: 'print-none' }}
          onClose={() => setEmailSent(false)}
        >
          Receipt email sent successfully!
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, display: 'print-none' }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          '@media print': {
            boxShadow: 'none',
            border: '1px solid #ddd'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Payment Receipt</Typography>
          <Chip 
            label={`Receipt #${receiptData.receiptNumber}`} 
            color="primary" 
            variant="outlined" 
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">Student Name</Typography>
            <Typography variant="body1">{receiptData.studentName}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">Student ID</Typography>
            <Typography variant="body1">{receiptData.studentId}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">Class</Typography>
            <Typography variant="body1">{receiptData.class}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">Payment Date</Typography>
            <Typography variant="body1">{new Date(receiptData.paymentDate).toLocaleDateString()}</Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">Amount Paid</Typography>
            <Typography variant="h6">₹{receiptData.amount.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">Payment Mode</Typography>
            <Typography variant="body1">{receiptData.paymentMode}</Typography>
          </Grid>
          {receiptData.transactionReference && (
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Transaction Reference</Typography>
              <Typography variant="body1">{receiptData.transactionReference}</Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">Description</Typography>
            <Typography variant="body1">{receiptData.description}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">Balance Remaining</Typography>
            <Typography variant="body1" color={receiptData.balanceRemaining > 0 ? 'error' : 'success'}>
              ₹{receiptData.balanceRemaining.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Receipt generated by {receiptData.createdBy} on {new Date().toLocaleString()}
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            mt: 3, 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2,
            '@media print': {
              display: 'none'
            }
          }}
        >
          <Button 
            variant="outlined" 
            startIcon={<EmailIcon />}
            onClick={handleSendEmail}
            disabled={loading || emailSent}
          >
            {loading ? 'Sending...' : emailSent ? 'Email Sent' : 'Email Receipt'}
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download PDF
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentReceipt;